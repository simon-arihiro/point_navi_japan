import { createAdminClient } from "@/lib/supabase/server";
import { getDailyTrend, getMonthlyTrend, getServiceRanking } from "@/lib/analytics";
import type { Metadata } from "next";
import AnalyticsFilters from "./AnalyticsFilters";
import TrendChart from "./TrendChart";

export const metadata: Metadata = { title: "アクセス分析" };

export default async function AdminAnalyticsPage(props: PageProps<"/admin/analytics">) {
  const searchParams = await props.searchParams;
  const granularity = searchParams.granularity === "month" ? "month" : "day";
  const defaultRange = granularity === "month" ? 12 : 30;
  const range = parseInt((searchParams.range as string) ?? "") || defaultRange;
  const serviceId = (searchParams.service_id as string) || "";

  const supabase = createAdminClient();

  const [{ data: services }, trend, ranking] = await Promise.all([
    supabase.from("services").select("id, name").is("deleted_at", null).order("name"),
    granularity === "month" ? getMonthlyTrend(supabase, range, serviceId || undefined) : getDailyTrend(supabase, range, serviceId || undefined),
    getServiceRanking(supabase, granularity === "month" ? range * 30 : range),
  ]);

  const totals = trend.reduce(
    (acc, d) => ({ pv: acc.pv + d.pv, rc: acc.rc + d.rc, cc: acc.cc + d.cc, share: acc.share + d.share }),
    { pv: 0, rc: 0, cc: 0, share: 0 }
  );

  const exportHref = `/api/analytics/export?granularity=${granularity}&range=${range}${serviceId ? `&service_id=${serviceId}` : ""}`;

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">アクセス分析</h1>

      <AnalyticsFilters services={services ?? []} granularity={granularity} range={range} serviceId={serviceId} />

      {/* サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "PV合計", value: totals.pv },
          { label: "紹介リンククリック数", value: totals.rc },
          { label: "コード・リンクコピー数", value: totals.cc },
          { label: "シェア数", value: totals.share },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-black text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-sm mt-1 text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* PVトレンド */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
        <h2 className="font-bold text-gray-900 mb-4">PVトレンド</h2>
        <TrendChart data={trend} series={[{ key: "pv", label: "PV", color: "#dc2626" }]} />
      </div>

      {/* 招待コード関連トレンド */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
        <h2 className="font-bold text-gray-900 mb-4">招待コード・紹介リンクの利用状況</h2>
        <TrendChart
          data={trend}
          series={[
            { key: "rc", label: "紹介リンククリック", color: "#2563eb" },
            { key: "cc", label: "コード・リンクコピー", color: "#16a34a" },
          ]}
        />
      </div>

      {/* 明細テーブル + CSVエクスポート */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-gray-900">{granularity === "month" ? "月別" : "日別"}明細</h2>
          <a
            href={exportHref}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            CSVダウンロード
          </a>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">{granularity === "month" ? "月" : "日付"}</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">PV</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">紹介リンククリック</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">コード・リンクコピー</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">シェア</th>
              </tr>
            </thead>
            <tbody>
              {[...trend].reverse().map((d) => (
                <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-2.5 font-medium text-gray-900">{d.date}</td>
                  <td className="text-right px-4 py-2.5 text-gray-700">{d.pv.toLocaleString()}</td>
                  <td className="text-right px-4 py-2.5 text-gray-700">{d.rc.toLocaleString()}</td>
                  <td className="text-right px-4 py-2.5 text-gray-700">{d.cc.toLocaleString()}</td>
                  <td className="text-right px-6 py-2.5 text-gray-700">{d.share.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 招待コードランキング */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">招待コード利用ランキング</h2>
          <p className="text-xs text-gray-400 mt-1">選択中の期間で、紹介リンククリック数・コピー数が多いサービス順</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">サービス</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">紹介リンククリック</th>
                <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">コード・リンクコピー</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr><td colSpan={3} className="text-center px-6 py-8 text-gray-400 text-sm">データなし</td></tr>
              ) : (
                ranking.slice(0, 20).map((r) => (
                  <tr key={r.service_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{r.rc.toLocaleString()}</td>
                    <td className="text-right px-6 py-3 text-gray-700">{r.cc.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
