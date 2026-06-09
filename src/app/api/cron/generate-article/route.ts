import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Vercel Cron: 毎日 JST 09:00（UTC 00:00）に呼び出し
// vercel.json: "crons": [{"path": "/api/cron/generate-article", "schedule": "0 0 * * *"}]
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  const { data: settings } = await supabase.from("system_settings").select("*").eq("id", 1).single();

  if (settings?.auto_generate_enabled === false) {
    return Response.json({ ok: true, generated: 0, reason: "auto_generate_disabled" });
  }

  const maxPending = settings?.max_pending_articles ?? 10;
  const { count: reviewingCount } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "reviewing");
  if ((reviewingCount ?? 0) >= maxPending) {
    return Response.json({ ok: true, generated: 0, reason: "max_pending_reached" });
  }

  const count = settings?.daily_article_count ?? 1;
  const windowDays = settings?.ranking_window_days ?? 30;
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  // アクティブなサービス一覧
  const { data: services } = await supabase.from("services").select("id").eq("status", "active");
  if (!services?.length) return Response.json({ ok: true, generated: 0 });

  // 直近の記事数を取得して加重計算
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("primary_service_id")
    .gte("created_at", windowStart.toISOString())
    .neq("article_type", "introduction");

  const recentCount = new Map<string, number>();
  for (const a of recentArticles ?? []) {
    recentCount.set(a.primary_service_id, (recentCount.get(a.primary_service_id) ?? 0) + 1);
  }

  // weight(service) = 1 / (recent_count + 1)
  const weighted = services.map((s) => ({
    id: s.id,
    weight: 1 / ((recentCount.get(s.id) ?? 0) + 1),
  }));

  // 加重ランダム選択
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const total = weighted.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * total;
    for (const w of weighted) {
      rand -= w.weight;
      if (rand <= 0 && !selected.includes(w.id)) {
        selected.push(w.id);
        break;
      }
    }
  }

  // 選択されたサービスの記事を生成
  let generated = 0;
  for (const serviceId of selected) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/generate-article`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: serviceId }),
    });
    if (res.ok) generated++;
  }

  return Response.json({ ok: true, generated });
}
