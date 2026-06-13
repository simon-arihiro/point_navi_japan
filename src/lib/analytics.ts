import { SupabaseClient } from "@supabase/supabase-js";

export interface ServiceStats {
  pv: number;
  rc: number;
  cc: number;
}

/**
 * analytics_daily（過去日分の集計済みデータ）に加えて、
 * 当日分は analytics_events から直接集計することで、
 * クリック直後でもランキング・サービス行動明細に反映されるようにする。
 */
export async function getServiceStatsMap(supabase: SupabaseClient, windowDays: number): Promise<Map<string, ServiceStats>> {
  const todayStr = new Date().toISOString().split("T")[0];
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const [{ data: dailyData }, { data: todayEvents }] = await Promise.all([
    supabase
      .from("analytics_daily")
      .select("service_id, page_views, referral_clicks, copy_code_count")
      .gte("date", windowStart.toISOString().split("T")[0])
      .lt("date", todayStr),
    supabase
      .from("analytics_events")
      .select("service_id, event_type")
      .gte("created_at", `${todayStr}T00:00:00Z`)
      .not("service_id", "is", null),
  ]);

  const statsMap = new Map<string, ServiceStats>();

  for (const row of dailyData ?? []) {
    const s = statsMap.get(row.service_id) ?? { pv: 0, rc: 0, cc: 0 };
    s.pv += row.page_views;
    s.rc += row.referral_clicks;
    s.cc += row.copy_code_count;
    statsMap.set(row.service_id, s);
  }

  for (const e of todayEvents ?? []) {
    const serviceId = e.service_id as string;
    const s = statsMap.get(serviceId) ?? { pv: 0, rc: 0, cc: 0 };
    if (e.event_type === "page_view" || e.event_type === "service_view" || e.event_type === "article_view") s.pv++;
    if (e.event_type === "referral_click") s.rc++;
    if (e.event_type === "copy_code") s.cc++;
    statsMap.set(serviceId, s);
  }

  return statsMap;
}

/**
 * 記事単体の閲覧回数（article_view の総数、全期間）。
 */
export async function getArticleViewCount(supabase: SupabaseClient, articleId: string): Promise<number> {
  const { count } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId)
    .eq("event_type", "article_view");

  return count ?? 0;
}

/**
 * 記事別の閲覧回数（article_id ごとの article_view 総数、全期間）。
 */
export async function getArticleViewCounts(supabase: SupabaseClient): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("analytics_events")
    .select("article_id")
    .eq("event_type", "article_view")
    .not("article_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const articleId = row.article_id as string;
    counts.set(articleId, (counts.get(articleId) ?? 0) + 1);
  }

  return counts;
}

/**
 * サービス別の閲覧回数（そのサービスに紐づく記事の article_view 総数、全期間）。
 */
export async function getServiceArticleViewCounts(supabase: SupabaseClient): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("analytics_events")
    .select("service_id")
    .eq("event_type", "article_view")
    .not("service_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const serviceId = row.service_id as string;
    counts.set(serviceId, (counts.get(serviceId) ?? 0) + 1);
  }

  return counts;
}
