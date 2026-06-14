import { createAdminClient } from "@/lib/supabase/server";
import { getDailyTrend, getMonthlyTrend } from "@/lib/analytics";
import { NextRequest } from "next/server";

// アクセス分析のトレンドデータをCSVでダウンロードする（Excel等で長期保存・閲覧する用途）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const granularity = searchParams.get("granularity") === "month" ? "month" : "day";
  const range = parseInt(searchParams.get("range") ?? (granularity === "month" ? "12" : "30"));
  const serviceId = searchParams.get("service_id") || undefined;

  const supabase = createAdminClient();
  const data = granularity === "month" ? await getMonthlyTrend(supabase, range, serviceId) : await getDailyTrend(supabase, range, serviceId);

  const header = granularity === "month" ? "月" : "日付";
  const rows = [
    [header, "PV", "紹介リンククリック数", "コード・リンクコピー数", "シェア数"],
    ...data.map((d) => [d.date, d.pv, d.rc, d.cc, d.share]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const bom = "﻿"; // ExcelでのShift-JIS化け防止

  return new Response(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics_${granularity}_${range}.csv"`,
    },
  });
}
