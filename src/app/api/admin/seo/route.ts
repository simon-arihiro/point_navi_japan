import { getGa4Summary, getGa4TopPages, getGa4DailyPageViews } from "@/lib/google/analytics";
import { getGscSummary, getGscTopQueries, getGscTopPages } from "@/lib/google/searchConsole";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "28"), 180);

  const [ga4Summary, ga4TopPages, ga4Daily, gscSummary, gscTopQueries, gscTopPages,
         ga4SummaryPrev, gscSummaryPrev] = await Promise.all([
    getGa4Summary(days),
    getGa4TopPages(days),
    getGa4DailyPageViews(days),
    getGscSummary(days),
    getGscTopQueries(days),
    getGscTopPages(days),
    getGa4Summary(days, days).catch(() => null),   // 前期（エラー時はnull）
    getGscSummary(days, days).catch(() => null),   // 前期（エラー時はnull）
  ]);

  return Response.json({ ga4Summary, ga4TopPages, ga4Daily, gscSummary, gscTopQueries, gscTopPages, ga4SummaryPrev, gscSummaryPrev });
}
