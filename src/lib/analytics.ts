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
 * cronはUTC 15:00（JST 0:00）に前日分(UTC)を analytics_daily へ集計する。
 * したがって「まだ集計されていないイベント」は UTC昨日 00:00Z 以降に存在する。
 * - analytics_daily: windowStart ～ UTCの前日まで
 * - analytics_events: UTCの前日 00:00Z 以降（未集計分をすべてカバー）
 * この2区間を合わせることで二重計上なく全データを取得できる。
 */
function getQueryBoundaries(windowDays: number) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // UTC今日 YYYY-MM-DD

  const utcYesterday = new Date(now);
  utcYesterday.setDate(utcYesterday.getDate() - 1);
  const utcYesterdayStr = utcYesterday.toISOString().split("T")[0];

  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - windowDays);
  const windowStartStr = windowStart.toISOString().split("T")[0];

  return {
    todayStr,
    utcYesterdayStr,
    windowStartStr,
    eventsStartISO: `${utcYesterdayStr}T00:00:00Z`,
  };
}

export async function getServiceStatsMap(supabase: SupabaseClient, windowDays: number): Promise<Map<string, ServiceStats>> {
  const { utcYesterdayStr, windowStartStr, eventsStartISO } = getQueryBoundaries(windowDays);

  const [{ data: dailyData }, { data: recentEvents }] = await Promise.all([
    supabase
      .from("analytics_daily")
      .select("service_id, page_views, referral_clicks, copy_code_count")
      .gte("date", windowStartStr)
      .lt("date", utcYesterdayStr),
    supabase
      .from("analytics_events")
      .select("service_id, event_type")
      .gte("created_at", eventsStartISO)
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

  for (const e of recentEvents ?? []) {
    const serviceId = e.service_id as string;
    const s = statsMap.get(serviceId) ?? { pv: 0, rc: 0, cc: 0 };
    if (e.event_type === "page_view" || e.event_type === "service_view" || e.event_type === "article_view") s.pv++;
    if (e.event_type === "referral_click") s.rc++;
    if (e.event_type === "copy_code") s.cc++;
    statsMap.set(serviceId, s);
  }

  return statsMap;
}

export async function getArticleViewCount(supabase: SupabaseClient, articleId: string): Promise<number> {
  const { count } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId)
    .eq("event_type", "article_view");

  return count ?? 0;
}

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

function addEventToStats(stats: { pv: number; rc: number; cc: number; share: number }, eventType: string) {
  if (eventType === "page_view" || eventType === "service_view" || eventType === "article_view") stats.pv++;
  if (eventType === "referral_click") stats.rc++;
  if (eventType === "copy_code") stats.cc++;
  if (eventType === "share_link") stats.share++;
}

export async function getDailyTrend(supabase: SupabaseClient, days: number, serviceId?: string): Promise<DailyStats[]> {
  const { utcYesterdayStr, windowStartStr, eventsStartISO } = getQueryBoundaries(days);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));

  let dailyQuery = supabase
    .from("analytics_daily")
    .select("date, service_id, page_views, referral_clicks, copy_code_count, share_count")
    .gte("date", windowStartStr)
    .lt("date", utcYesterdayStr);
  if (serviceId) dailyQuery = dailyQuery.eq("service_id", serviceId);

  let eventsQuery = supabase
    .from("analytics_events")
    .select("event_type, service_id, created_at")
    .gte("created_at", eventsStartISO);
  if (serviceId) eventsQuery = eventsQuery.eq("service_id", serviceId);

  const [{ data: dailyData }, { data: recentEvents }] = await Promise.all([dailyQuery, eventsQuery]);

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

  for (const e of recentEvents ?? []) {
    const eventDate = (e.created_at as string).split("T")[0];
    const entry = map.get(eventDate);
    if (!entry) continue;
    addEventToStats(entry, e.event_type);
  }

  return Array.from(map.values());
}

export async function getMonthlyTrend(supabase: SupabaseClient, months: number, serviceId?: string): Promise<DailyStats[]> {
  const { utcYesterdayStr, eventsStartISO } = getQueryBoundaries(30);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const startStr = start.toISOString().split("T")[0];

  let dailyQuery = supabase
    .from("analytics_daily")
    .select("date, service_id, page_views, referral_clicks, copy_code_count, share_count")
    .gte("date", startStr)
    .lt("date", utcYesterdayStr);
  if (serviceId) dailyQuery = dailyQuery.eq("service_id", serviceId);

  let eventsQuery = supabase
    .from("analytics_events")
    .select("event_type, service_id, created_at")
    .gte("created_at", eventsStartISO);
  if (serviceId) eventsQuery = eventsQuery.eq("service_id", serviceId);

  const [{ data: dailyData }, { data: recentEvents }] = await Promise.all([dailyQuery, eventsQuery]);

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

  for (const e of recentEvents ?? []) {
    const monthKey = (e.created_at as string).slice(0, 7);
    const entry = map.get(monthKey);
    if (!entry) continue;
    addEventToStats(entry, e.event_type);
  }

  return Array.from(map.values());
}

export async function getServiceRanking(supabase: SupabaseClient, days: number): Promise<ServiceRanking[]> {
  const { utcYesterdayStr, windowStartStr, eventsStartISO } = getQueryBoundaries(days);

  const [{ data: dailyData }, { data: recentEvents }, { data: services }] = await Promise.all([
    supabase.from("analytics_daily").select("service_id, referral_clicks, copy_code_count").gte("date", windowStartStr).lt("date", utcYesterdayStr),
    supabase
      .from("analytics_events")
      .select("service_id, event_type")
      .gte("created_at", eventsStartISO)
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
  for (const e of recentEvents ?? []) {
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
