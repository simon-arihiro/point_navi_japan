"use client";

import { useState, useEffect, useCallback } from "react";

type Ga4Summary = { sessions: number; activeUsers: number; screenPageViews: number; averageSessionDuration: number; bounceRate: number };
type Ga4PageRow = { path: string; views: number; sessions: number };
type GscSummary = { clicks: number; impressions: number; ctr: number; position: number };
type GscQueryRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };
type GscPageRow = { page: string; clicks: number; impressions: number; ctr: number; position: number };

type SeoData = {
  ga4Summary: Ga4Summary | null;
  ga4TopPages: Ga4PageRow[] | null;
  gscSummary: GscSummary | null;
  gscTopQueries: GscQueryRow[] | null;
  gscTopPages: GscPageRow[] | null;
};

const PERIODS = [
  { label: "7日間", value: 7 },
  { label: "28日間", value: 28 },
  { label: "90日間", value: 90 },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      <p className="text-sm mt-1 text-gray-500">{label}</p>
    </div>
  );
}

function positionBadge(pos: number) {
  if (pos <= 3) return <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">{pos.toFixed(1)}</span>;
  if (pos <= 10) return <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">{pos.toFixed(1)}</span>;
  if (pos <= 20) return <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">{pos.toFixed(1)}</span>;
  return <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">{pos.toFixed(1)}</span>;
}

function isOpportunity(row: GscQueryRow | GscPageRow) {
  return row.impressions >= 50 && row.position >= 5 && row.position <= 20;
}

function shortPath(url: string) {
  try { return new URL(url).pathname; } catch { return url; }
}

export default function AdminSeoPage() {
  const [days, setDays] = useState(28);
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"queries" | "pages" | "ga4">("queries");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/seo?days=${days}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const opportunities = data?.gscTopQueries?.filter(isOpportunity) ?? [];
  const pageOpportunities = data?.gscTopPages?.filter(isOpportunity) ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">SEO分析</h1>
          <p className="text-xs text-gray-400 mt-1">Google Analytics（GA4）・Search Console 統合ダッシュボード</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                days === p.value ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button onClick={load} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            🔄
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">読み込み中...</div>
      )}

      {!loading && data && (
        <>
          {/* GA4サマリー */}
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Google Analytics（GA4）</h2>
          {data.ga4Summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              <StatCard label="セッション数" value={data.ga4Summary.sessions.toLocaleString()} />
              <StatCard label="アクティブユーザー" value={data.ga4Summary.activeUsers.toLocaleString()} />
              <StatCard label="ページビュー" value={data.ga4Summary.screenPageViews.toLocaleString()} />
              <StatCard label="平均セッション時間" value={`${Math.round(data.ga4Summary.averageSessionDuration)}秒`} sub={`約${Math.floor(data.ga4Summary.averageSessionDuration / 60)}分`} />
              <StatCard label="直帰率" value={`${(data.ga4Summary.bounceRate * 100).toFixed(1)}%`} />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">GA4 未接続（GOOGLE_SERVICE_ACCOUNT_KEY / GA4_PROPERTY_ID 未設定）</div>
          )}

          {/* GSCサマリー */}
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Google Search Console</h2>
          {data.gscSummary ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="クリック数" value={data.gscSummary.clicks.toLocaleString()} />
              <StatCard label="表示回数" value={data.gscSummary.impressions.toLocaleString()} />
              <StatCard label="平均CTR" value={`${(data.gscSummary.ctr * 100).toFixed(2)}%`} />
              <StatCard label="平均掲載順位" value={data.gscSummary.position.toFixed(1)} sub="低いほど良い" />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">Search Console 未接続（GOOGLE_SERVICE_ACCOUNT_KEY / GSC_SITE_URL 未設定）</div>
          )}

          {/* 改善機会 */}
          {(opportunities.length > 0 || pageOpportunities.length > 0) && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6">
              <h3 className="font-black text-amber-900 mb-3">🎯 改善チャンス（表示回数50以上・順位5〜20位）</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {opportunities.slice(0, 5).map((q) => (
                  <div key={q.query} className="bg-white rounded-xl p-3 border border-amber-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 text-sm">{q.query}</span>
                      {positionBadge(q.position)}
                    </div>
                    <p className="text-xs text-gray-500">表示 {q.impressions} / クリック {q.clicks} / CTR {(q.ctr * 100).toFixed(1)}%</p>
                  </div>
                ))}
                {pageOpportunities.slice(0, 5).map((p) => (
                  <div key={p.page} className="bg-white rounded-xl p-3 border border-amber-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{shortPath(p.page)}</span>
                      {positionBadge(p.position)}
                    </div>
                    <p className="text-xs text-gray-500">表示 {p.impressions} / クリック {p.clicks} / CTR {(p.ctr * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* タブ切り替え */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
            {([
              { key: "queries", label: "🔍 検索クエリ" },
              { key: "pages", label: "📄 ページ別（GSC）" },
              { key: "ga4", label: "📊 ページ別（GA4）" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 検索クエリ */}
          {activeTab === "queries" && data.gscTopQueries && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">検索クエリ別パフォーマンス</h2>
                <span className="text-xs text-gray-400">{data.gscTopQueries.length}件</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">検索クエリ</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">クリック</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">表示回数</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">CTR</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">順位</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gscTopQueries.map((q) => (
                      <tr key={q.query} className={`border-b border-gray-50 hover:bg-gray-50 ${isOpportunity(q) ? "bg-amber-50/40" : ""}`}>
                        <td className="px-6 py-2.5 font-medium text-gray-900">
                          {q.query}
                          {isOpportunity(q) && <span className="ml-2 text-xs text-amber-600">🎯</span>}
                        </td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{q.clicks}</td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{q.impressions}</td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{(q.ctr * 100).toFixed(1)}%</td>
                        <td className="text-right px-6 py-2.5">{positionBadge(q.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ページ別（GSC） */}
          {activeTab === "pages" && data.gscTopPages && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">ページ別検索パフォーマンス（Search Console）</h2>
                <span className="text-xs text-gray-400">{data.gscTopPages.length}件</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">ページ</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">クリック</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">表示回数</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">CTR</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">順位</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gscTopPages.map((p) => (
                      <tr key={p.page} className={`border-b border-gray-50 hover:bg-gray-50 ${isOpportunity(p) ? "bg-amber-50/40" : ""}`}>
                        <td className="px-6 py-2.5 font-medium text-gray-900">
                          <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-700">
                            {shortPath(p.page)}
                          </a>
                          {isOpportunity(p) && <span className="ml-2 text-xs text-amber-600">🎯</span>}
                        </td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{p.clicks}</td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{p.impressions}</td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{(p.ctr * 100).toFixed(1)}%</td>
                        <td className="text-right px-6 py-2.5">{positionBadge(p.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ページ別（GA4） */}
          {activeTab === "ga4" && data.ga4TopPages && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">ページ別アクセス（GA4）</h2>
                <span className="text-xs text-gray-400">{data.ga4TopPages.length}件</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">ページ</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">ページビュー</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 font-medium">セッション数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ga4TopPages.map((p) => (
                      <tr key={p.path} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-2.5 font-medium text-gray-900">{p.path}</td>
                        <td className="text-right px-4 py-2.5 text-gray-700">{p.views.toLocaleString()}</td>
                        <td className="text-right px-6 py-2.5 text-gray-700">{p.sessions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
