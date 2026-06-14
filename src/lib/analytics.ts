import { SupabaseClient } from "@supabase/supabase-js";

export interface ServiceStats {
  pv: number;
  rc: number;
  cc: number;
}

export interface DailyStats {
  date: string; // 日別は YYYY-MM-DD、月別は YYYY-MM
  pv: number;
  rc: number;
  cc: number;
  share: number;
}

export interface ServiceRanking {
  service_id: string;
  name: string;
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
 * 指定した記事IDのみを対象とした閲覧回数（article_id ごとの article_view 総数、全期間）。
 */
export async function getArticleViewCountsForIds(supabase: SupabaseClient, articleIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (articleIds.length === 0) return counts;

  const { data } = await supabase
    .from("analytics_events")
    .select("article_id")
    .eq("event_type", "article_view")
    .in("article_id", articleIds);

  for (const row of data ?? []) {
    const articleId = row.article_id as string;
    counts.set(articleId, (counts.get(articleId) ?? 0) + 1);
  }

  return counts;
}

// イベント種別を集計用カウンタに振り分ける
function addEventToStats(stats: { pv: number; rc: number; cc: number; share: number }, eventType: string) {
  if (eventType === "page_view" || eventType === "service_view" || eventType === "article_view") stats.pv++;
  if (eventType === "referral_click") stats.rc++;
  if (eventType === "copy_code") stats.cc++;
  if (eventType === "share_link") stats.share++;
}

/**
 * 日別トレンド: 直近days日間（当日含む）のPV・紹介リンククリック・コピー・シェア数を日付ごとに返す。
 * serviceIdを指定するとそのサービスのみに絞り込む。
 */
export async function getDailyTrend(supabase: SupabaseClient, days: number, serviceId?: string): Promise<DailyStats[]> {
  const todayStr = new Date().toISOString().split("T")[0];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().split("T")[0];

  let dailyQuery = supabase
    .from("analytics_daily")
    .select("date, service_id, page_views, referral_clicks, copy_code_count, share_count")
    .gte("date", startStr)
    .lt("date", todayStr);
  if (serviceId) dailyQuery = dailyQuery.eq("service_id", serviceId);

  let eventsQuery = supabase.from("analytics_events").select("event_type, service_id").gte("created_at", `${todayStr}T00:00:00Z`);
  if (serviceId) eventsQuery = eventsQuery.eq("service_id", serviceId);

  const [{ data: dailyData }, { data: todayEvents }] = await Promise.all([dailyQuery, eventsQuery]);

  const map = new Map<string, DailyStats>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    map.set(key, { date: key, pv: 0, rc: 0, cc: 0, share: 0 });
  }

  for (const row of dailyData ?? []) {
    const entry = map.get(row.date);
    if (!entry) continue;
    entry.pv += row.page_views;
    entry.rc += row.referral_clicks;
    entry.cc += row.copy_code_count;
    entry.share += row.share_count;
  }

  const todayEntry = map.get(todayStr);
  if (todayEntry) {
    for (const e of todayEvents ?? []) addEventToStats(todayEntry, e.event_type);
  }

  return Array.from(map.values());
}

/**
 * 月別トレンド: 直近months ヶ月間（今月含む）のPV・紹介リンククリック・コピー・シェア数を月ごとに返す。
 * serviceIdを指定するとそのサービスのみに絞り込む。
 */
export async function getMonthlyTrend(supabase: SupabaseClient, months: number, serviceId?: string): Promise<DailyStats[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const startStr = start.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  let dailyQuery = supabase
    .from("analytics_daily")
    .select("date, service_id, page_views, referral_clicks, copy_code_count, share_count")
    .gte("date", startStr)
    .lt("date", todayStr);
  if (serviceId) dailyQuery = dailyQuery.eq("service_id", serviceId);

  let eventsQuery = supabase.from("analytics_events").select("event_type, service_id").gte("created_at", `${todayStr}T00:00:00Z`);
  if (serviceId) eventsQuery = eventsQuery.eq("service_id", serviceId);

  const [{ data: dailyData }, { data: todayEvents }] = await Promise.all([dailyQuery, eventsQuery]);

  const map = new Map<string, DailyStats>();
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, { date: key, pv: 0, rc: 0, cc: 0, share: 0 });
  }

  for (const row of dailyData ?? []) {
    const entry = map.get(row.date.slice(0, 7));
    if (!entry) continue;
    entry.pv += row.page_views;
    entry.rc += row.referral_clicks;
    entry.cc += row.copy_code_count;
    entry.share += row.share_count;
  }

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentEntry = map.get(currentMonthKey);
  if (currentEntry) {
    for (const e of todayEvents ?? []) addEventToStats(currentEntry, e.event_type);
  }

  return Array.from(map.values());
}

/**
 * サービス別の招待コードランキング: 直近days日間（当日含む）の紹介リンククリック数・コピー回数が多い順。
 */
export async function getServiceRanking(supabase: SupabaseClient, days: number): Promise<ServiceRanking[]> {
  const todayStr = new Date().toISOString().split("T")[0];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().split("T")[0];

  const [{ data: dailyData }, { data: todayEvents }, { data: services }] = await Promise.all([
    supabase.from("analytics_daily").select("service_id, referral_clicks, copy_code_count").gte("date", startStr).lt("date", todayStr),
    supabase
      .from("analytics_events")
      .select("service_id, event_type")
      .gte("created_at", `${todayStr}T00:00:00Z`)
      .not("service_id", "is", null)
      .in("event_type", ["referral_click", "copy_code"]),
    supabase.from("services").select("id, name").is("deleted_at", null),
  ]);

  const map = new Map<string, { rc: number; cc: number }>();
  for (const row of dailyData ?? []) {
    const s = map.get(row.service_id) ?? { rc: 0, cc: 0 };
    s.rc += row.referral_clicks;
    s.cc += row.copy_code_count;
    map.set(row.service_id, s);
  }
  for (const e of todayEvents ?? []) {
    const serviceId = e.service_id as string;
    const s = map.get(serviceId) ?? { rc: 0, cc: 0 };
    if (e.event_type === "referral_click") s.rc++;
    if (e.event_type === "copy_code") s.cc++;
    map.set(serviceId, s);
  }

  const nameMap = new Map((services ?? []).map((s) => [s.id, s.name as string]));

  return Array.from(map.entries())
    .map(([service_id, v]) => ({ service_id, name: nameMap.get(service_id) ?? "(不明なサービス)", rc: v.rc, cc: v.cc }))
    .filter((r) => r.rc > 0 || r.cc > 0)
    .sort((a, b) => (b.rc + b.cc) - (a.rc + a.cc));
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
