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
