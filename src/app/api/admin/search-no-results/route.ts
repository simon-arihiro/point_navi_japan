import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30");

  const db = createAdminClient();
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

  // キーワード別集計
  const { data: logs } = await db
    .from("search_no_results_log")
    .select("keyword, page, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  // キーワードごとにカウント
  const countMap: Record<string, { count: number; page: string; last: string }> = {};
  for (const log of logs ?? []) {
    const key = log.keyword.toLowerCase();
    if (!countMap[key]) {
      countMap[key] = { count: 0, page: log.page, last: log.created_at };
    }
    countMap[key].count++;
    if (log.created_at > countMap[key].last) countMap[key].last = log.created_at;
  }

  const ranking = Object.entries(countMap)
    .map(([keyword, v]) => ({ keyword, ...v }))
    .sort((a, b) => b.count - a.count);

  return Response.json({ ranking, total: logs?.length ?? 0 });
}
