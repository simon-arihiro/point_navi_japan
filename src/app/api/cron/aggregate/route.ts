import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Vercel Cron: 毎日 JST 00:00（UTC 15:00）に呼び出し
// vercel.json: "crons": [{"path": "/api/cron/aggregate", "schedule": "0 15 * * *"}]
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  // 前日のイベントを集計
  const { data: events } = await supabase
    .from("analytics_events")
    .select("service_id, event_type")
    .gte("created_at", `${dateStr}T00:00:00Z`)
    .lt("created_at", `${dateStr}T23:59:59Z`)
    .not("service_id", "is", null);

  if (!events?.length) return Response.json({ ok: true, aggregated: 0 });

  // service_id 別に集計
  const map = new Map<string, { page_views: number; referral_clicks: number; copy_code_count: number; share_count: number }>();
  for (const e of events) {
    if (!e.service_id) continue;
    if (!map.has(e.service_id)) map.set(e.service_id, { page_views: 0, referral_clicks: 0, copy_code_count: 0, share_count: 0 });
    const row = map.get(e.service_id)!;
    if (e.event_type === "page_view" || e.event_type === "service_view") row.page_views++;
    if (e.event_type === "referral_click") row.referral_clicks++;
    if (e.event_type === "copy_code") row.copy_code_count++;
    if (e.event_type === "share_link") row.share_count++;
  }

  const upserts = Array.from(map.entries()).map(([service_id, stats]) => ({
    date: dateStr, service_id, ...stats,
  }));

  await supabase.from("analytics_daily").upsert(upserts, { onConflict: "date,service_id" });

  return Response.json({ ok: true, aggregated: upserts.length });
}
