import type { Metadata } from "next";
import { getGa4Summary, getGa4TopPages } from "@/lib/google/analytics";
import { getGscSummary, getGscTopQueries, getGscTopPages } from "@/lib/google/searchConsole";

export const metadata: Metadata = { title: "SEO分析" };

const RANGE_DAYS = 28;

function NotConfiguredNotice({ what }: { what: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
      {what} が未接続です。<code className="bg-amber-100 px-1.5 py-0.5 rounded">GOOGLE_SERVICE_ACCOUNT_KEY</code> /
      関連するプロパティID・サイトURLの環境変数をVercelに設定してください。
    </div>
  );
}

export default async function AdminSeoPage() {
  const [ga4Summary, ga4TopPages, gscSummary, gscTopQueries, gscTopPages] = await Promise.all([
    getGa4Summary(RANGE_DAYS),
    getGa4TopPages(RANGE_DAYS),
    getGscSummary(RANGE_DAYS),
    getGscTopQueries(RANGE_DAYS),
    getGscTopPages(RANGE_DAYS),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">SEO分析</h1>
      <p className="text-xs text-gray-400 mb-6">過去{RANGE_DAYS}日間のGoogle Analytics（GA4）・Search Consoleデータ</p>

      {/* GA4 サマリー */}
      <h2 className="font-bold text-gray-900 mb-3">Google Analytics（GA4）</h2>
      {ga4Summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "セッション数", value: ga4Summary.sessions.toLocaleString() },
            { label: "アクティブユーザー", value: ga4Summary.activeUsers.toLocaleString() },
            { label: "ページビュー", value: ga4Summary.screenPageViews.toLocaleString() },
            { label: "平均セッション時間", value: `${Math.round(ga4Summary.averageSessionDuration)}秒` },
            { label: "直帰率", value: `${(ga4Summary.bounceRate * 100).toFixed(1)}%` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm mt-1 text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8"><NotConfiguredNotice what="GA4 Data API" /></div>
      )}

      {ga4TopPages && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">よく見られているページ（GA4）</h2>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">ページ</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">表示回数</th>
                  <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">セッション数</th>
                </tr>
              </thead>
              <tbody>
                {ga4TopPages.length === 0 ? (
                  <tr><td colSpan={3} className="text-center px-6 py-8 text-gray-400 text-sm">データなし</td></tr>
                ) : (
                  ga4TopPages.map((p) => (
                    <tr key={p.path} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-2.5 font-medium text-gray-900 truncate max-w-md">{p.path}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{p.views.toLocaleString()}</td>
                      <td className="text-right px-6 py-2.5 text-gray-700">{p.sessions.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Console サマリー */}
      <h2 className="font-bold text-gray-900 mb-3">Google Search Console</h2>
      {gscSummary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "クリック数", value: gscSummary.clicks.toLocaleString() },
            { label: "表示回数", value: gscSummary.impressions.toLocaleString() },
            { label: "CTR", value: `${(gscSummary.ctr * 100).toFixed(2)}%` },
            { label: "平均掲載順位", value: gscSummary.position.toFixed(1) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm mt-1 text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8"><NotConfiguredNotice what="Search Console API" /></div>
      )}

      {gscTopQueries && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">検索クエリ別パフォーマンス</h2>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">検索クエリ</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">クリック</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">表示回数</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">CTR</th>
                  <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">平均順位</th>
                </tr>
              </thead>
              <tbody>
                {gscTopQueries.length === 0 ? (
                  <tr><td colSpan={5} className="text-center px-6 py-8 text-gray-400 text-sm">データなし</td></tr>
                ) : (
                  gscTopQueries.map((q) => (
                    <tr key={q.query} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-2.5 font-medium text-gray-900">{q.query}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{q.clicks.toLocaleString()}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{q.impressions.toLocaleString()}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{(q.ctr * 100).toFixed(2)}%</td>
                      <td className="text-right px-6 py-2.5 text-gray-700">{q.position.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gscTopPages && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">ページ別検索パフォーマンス</h2>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">ページ</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">クリック</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">表示回数</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">CTR</th>
                  <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">平均順位</th>
                </tr>
              </thead>
              <tbody>
                {gscTopPages.length === 0 ? (
                  <tr><td colSpan={5} className="text-center px-6 py-8 text-gray-400 text-sm">データなし</td></tr>
                ) : (
                  gscTopPages.map((p) => (
                    <tr key={p.page} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-2.5 font-medium text-gray-900 truncate max-w-md">{p.page}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{p.clicks.toLocaleString()}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{p.impressions.toLocaleString()}</td>
                      <td className="text-right px-4 py-2.5 text-gray-700">{(p.ctr * 100).toFixed(2)}%</td>
                      <td className="text-right px-6 py-2.5 text-gray-700">{p.position.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
