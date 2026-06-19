import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Vercel Cron: 日本時間の各時0分（UTC各時0分の9時間後）に呼び出し、その時刻に該当する定時発行タイマーを実行する
// vercel.json: 1時間ごとに24個のcronエントリを登録（同じpathでscheduleだけ異なる）
// 分単位の細かいタイマーが必要な場合は、本エンドポイントを数分おきに叩く外部スケジューラ（cron-job.org等）からも安全に呼び出せる（許容ウィンドウ10分・同日二重発火防止つき）
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // UTC -> JST (UTC+9) に変換
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const currentHour = jst.getUTCHours();
  const currentMinute = jst.getUTCMinutes();
  const todayJst = jst.toISOString().slice(0, 10);

  const { data: schedules, error: scheduleError } = await supabase
    .from("publish_schedules")
    .select("*")
    .eq("enabled", true)
    .eq("hour", currentHour)
    .or(`last_run_date.is.null,last_run_date.neq.${todayJst}`);

  if (scheduleError) {
    return Response.json({ ok: false, error: scheduleError.message }, { status: 500 });
  }

  // 許容ウィンドウ10分以内に予定時刻を迎えたタイマーのみ実行（Vercel hourly cronはminute=0で呼ばれるため、minute=0設定のタイマーが対象になる）
  const dueSchedules = (schedules ?? []).filter((s) => currentMinute >= s.minute && currentMinute < s.minute + 10);

  const results: { schedule_id: string; published_count: number }[] = [];

  for (const schedule of dueSchedules) {
    const { data: queuedArticles } = await supabase
      .from("articles")
      .select("id")
      .eq("status", "queued")
      .is("deleted_at", null)
      .order("updated_at", { ascending: true })
      .limit(schedule.count);

    const ids = (queuedArticles ?? []).map((a) => a.id);
    if (ids.length > 0) {
      await supabase.from("articles").update({ status: "published", published_at: new Date().toISOString() }).in("id", ids);
    }

    await supabase.from("publish_schedules").update({ last_run_date: todayJst }).eq("id", schedule.id);
    results.push({ schedule_id: schedule.id, published_count: ids.length });
  }

  return Response.json({ ok: true, jst_time: `${currentHour}:${String(currentMinute).padStart(2, "0")}`, results });
}
