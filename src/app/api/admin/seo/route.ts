import { getGa4Summary, getGa4TopPages } from "@/lib/google/analytics";
import { getGscSummary, getGscTopQueries, getGscTopPages } from "@/lib/google/searchConsole";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "28"), 180);

  const [ga4Summary, ga4TopPages, gscSummary, gscTopQueries, gscTopPages] = await Promise.all([
    getGa4Summary(days),
    getGa4TopPages(days),
    getGscSummary(days),
    getGscTopQueries(days),
    getGscTopPages(days),
  ]);

  return Response.json({ ga4Summary, ga4TopPages, gscSummary, gscTopQueries, gscTopPages });
}
