"use client";

import { useState, useEffect, useCallback } from "react";

type Ga4Summary = { sessions: number; activeUsers: number; screenPageViews: number; averageSessionDuration: number; bounceRate: number };
type Ga4PageRow = { path: string; views: number; sessions: number };
type GscSummary = { clicks: number; impressions: number; ctr: number; position: number };
type GscQueryRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };
type KeywordStatus = { query: string; status: "pending" | "in_progress" | "done"; notes?: string | null };
type GscPageRow = { page: string; clicks: number; impressions: number; ctr: number; position: number };

type Ga4DailyRow = { date: string; views: number; sessions: number; activeUsers: number };

type SeoData = {
  ga4Summary: Ga4Summary | null;
  ga4TopPages: Ga4PageRow[] | null;
  ga4Daily: Ga4DailyRow[] | null;
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

type ChartMetric = "views" | "sessions" | "activeUsers";

const CHART_METRICS: { key: ChartMetric; label: string; color: string; dasharray?: string }[] = [
  { key: "views", label: "ページビュー", color: "#6366f1" },
  { key: "sessions", label: "セッション数", color: "#fbbf24" },
  { key: "activeUsers", label: "アクティブユーザー", color: "#10b981" },
];

function PvChart({ data }: { data: Ga4DailyRow[] }) {
  const [primary, setPrimary] = useState<ChartMetric>("views");
  const [secondary, setSecondary] = useState<ChartMetric | "none">("sessions");

  if (!data || data.length === 0) return null;
  const W = 800, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xs = data.map((_, i) => PAD.left + (i / Math.max(data.length - 1, 1)) * innerW);

  const maxPrimary = Math.max(...data.map((d) => d[primary]), 1);
  const ys = data.map((d) => PAD.top + (1 - d[primary] / maxPrimary) * innerH);
  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const area = `M${xs[0]},${ys[0]} ` + xs.slice(1).map((x, i) => `L${x},${ys[i + 1]}`).join(" ") + ` L${xs[xs.length - 1]},${PAD.top + innerH} L${xs[0]},${PAD.top + innerH} Z`;

  const primaryMeta = CHART_METRICS.find((m) => m.key === primary)!;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD.top + (1 - t) * innerH,
    label: Math.round(maxPrimary * t).toLocaleString(),
  }));

  const xStep = Math.max(1, Math.floor(data.length / 6));
  const xTicks = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % xStep === 0 || i === data.length - 1)
    .map(({ d, i }) => ({ x: xs[i], label: d.date.slice(4, 6) + "/" + d.date.slice(6, 8) }));

  let secondaryPolyline: string | null = null;
  let secondaryColor = "";
  if (secondary !== "none") {
    const maxSec = Math.max(...data.map((d) => d[secondary]), 1);
    const ys2 = data.map((d) => PAD.top + (1 - d[secondary] / maxSec) * innerH);
    secondaryPolyline = xs.map((x, i) => `${x},${ys2[i]}`).join(" ");
    secondaryColor = CHART_METRICS.find((m) => m.key === secondary)!.color;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="font-bold text-gray-900 text-sm">📈 トレンド（日別）</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary metric selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 shrink-0">主軸：</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {CHART_METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => { setPrimary(m.key); if (secondary === m.key) setSecondary("none"); }}
                  className={`px-2.5 py-1 font-bold transition-colors ${primary === m.key ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  style={primary === m.key ? { backgroundColor: m.color } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {/* Secondary metric selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 shrink-0">比較：</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              <button
                onClick={() => setSecondary("none")}
                className={`px-2.5 py-1 font-bold transition-colors ${secondary === "none" ? "bg-gray-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                なし
              </button>
              {CHART_METRICS.filter((m) => m.key !== primary).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSecondary(m.key)}
                  className={`px-2.5 py-1 font-bold transition-colors ${secondary === m.key ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  style={secondary === m.key ? { backgroundColor: m.color } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 200 }}>
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.left} y1={t.y} x2={PAD.left + innerW} y2={t.y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{t.label}</text>
          </g>
        ))}
        <path d={area} fill={primaryMeta.color + "14"} />
        <polyline points={polyline} fill="none" stroke={primaryMeta.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {secondaryPolyline && (
          <polyline points={secondaryPolyline} fill="none" stroke={secondaryColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 2" />
        )}
        {xTicks.map((t) => (
          <text key={t.x} x={t.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">{t.label}</text>
        ))}
        {data.length <= 31 && xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="2.5" fill={primaryMeta.color} />
        ))}
      </svg>
    </div>
  );
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:     { label: "未処理", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "最適化中", color: "bg-blue-100 text-blue-700" },
  done:        { label: "完了", color: "bg-green-100 text-green-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
}

export default function AdminSeoPage() {
  const [days, setDays] = useState(28);
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"queries" | "pages" | "ga4">("queries");
  const [keywordStatuses, setKeywordStatuses] = useState<Map<string, KeywordStatus>>(new Map());
  const [savingQuery, setSavingQuery] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [seoRes, statusRes] = await Promise.all([
      fetch(`/api/admin/seo?days=${days}`),
      fetch("/api/admin/seo-status"),
    ]);
    const json = await seoRes.json();
    const statusJson = await statusRes.json();
    setData(json);
    const map = new Map<string, KeywordStatus>();
    for (const row of (statusJson.data ?? [])) map.set(row.query, row);
    setKeywordStatuses(map);
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (query: string, status: string) => {
    setSavingQuery(query);
    await fetch("/api/admin/seo-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, status }),
    });
    setKeywordStatuses((prev) => {
      const next = new Map(prev);
      next.set(query, { query, status: status as KeywordStatus["status"] });
      return next;
    });
    setSavingQuery(null);
  };

  const opportunities = data?.gscTopQueries?.filter(isOpportunity) ?? [];
  const pageOpportunities = data?.gscTopPages?.filter(isOpportunity) ?? [];
  // S級：順位5-10 かつ Impressions >= 100
  const sGradeOpportunities = opportunities.filter((q) => q.position <= 10 && q.impressions >= 100);
  // A級：順位10-20 かつ Impressions >= 100（S級除く）
  const aGradeOpportunities = opportunities.filter((q) => q.position > 10 && q.impressions >= 100);

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
          {/* PVトレンドチャート */}
          {data.ga4Daily && data.ga4Daily.length > 0 && (
            <PvChart data={data.ga4Daily} />
          )}

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

          {/* 改善機会 - S/A級 */}
          {(sGradeOpportunities.length > 0 || aGradeOpportunities.length > 0 || opportunities.length > 0) && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-amber-900">🎯 改善チャンス（表示回数50以上・順位5〜20位）</h3>
                <div className="flex gap-3 text-xs text-amber-700">
                  <span>S級 <strong>{sGradeOpportunities.length}</strong>件</span>
                  <span>A級 <strong>{aGradeOpportunities.length}</strong>件</span>
                </div>
              </div>

              {/* S級 */}
              {sGradeOpportunities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-red-700 mb-2">🔴 S級（順位5〜10位・表示100以上） — 最優先</p>
                  <div className="space-y-2">
                    {sGradeOpportunities.map((q) => {
                      const ks = keywordStatuses.get(q.query);
                      return (
                        <div key={q.query} className="bg-white rounded-xl p-3 border border-red-200 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">{q.query}</span>
                              {positionBadge(q.position)}
                            </div>
                            <p className="text-xs text-gray-500">表示 {q.impressions} / クリック {q.clicks} / CTR {(q.ctr * 100).toFixed(1)}%</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={ks?.status ?? "pending"} />
                            <select
                              value={ks?.status ?? "pending"}
                              disabled={savingQuery === q.query}
                              onChange={(e) => updateStatus(q.query, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                            >
                              <option value="pending">未処理</option>
                              <option value="in_progress">最適化中</option>
                              <option value="done">完了</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* A級 */}
              {aGradeOpportunities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-amber-700 mb-2">🟡 A級（順位10〜20位・表示100以上）</p>
                  <div className="space-y-2">
                    {aGradeOpportunities.map((q) => {
                      const ks = keywordStatuses.get(q.query);
                      return (
                        <div key={q.query} className="bg-white rounded-xl p-3 border border-amber-200 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">{q.query}</span>
                              {positionBadge(q.position)}
                            </div>
                            <p className="text-xs text-gray-500">表示 {q.impressions} / クリック {q.clicks} / CTR {(q.ctr * 100).toFixed(1)}%</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={ks?.status ?? "pending"}
                              disabled={savingQuery === q.query}
                              onChange={(e) => updateStatus(q.query, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                            >
                              <option value="pending">未処理</option>
                              <option value="in_progress">最適化中</option>
                              <option value="done">完了</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* その他（B級：表示50以上だがS/A条件外） */}
              {opportunities.filter((q) => q.impressions < 100).length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-amber-700 cursor-pointer font-bold">🟢 その他（表示50〜99件） {opportunities.filter((q) => q.impressions < 100).length}件</summary>
                  <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {opportunities.filter((q) => q.impressions < 100).map((q) => (
                      <div key={q.query} className="bg-white rounded-xl p-3 border border-amber-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900 text-sm">{q.query}</span>
                          {positionBadge(q.position)}
                        </div>
                        <p className="text-xs text-gray-500">表示 {q.impressions} / クリック {q.clicks} / CTR {(q.ctr * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
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
