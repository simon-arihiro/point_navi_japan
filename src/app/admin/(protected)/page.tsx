import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ダッシュボード" };

export default async function AdminDashboard(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const days = searchParams.days === "7" ? 7 : 30;

  const supabase = createAdminClient();
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - days);

  const [
    { count: activeServices },
    { count: introArticles },
    { count: relatedArticles },
    { count: pendingArticles },
    { data: analyticsRows },
    { data: servicesList },
  ] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("article_type", "introduction").eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).neq("article_type", "introduction").eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "reviewing"),
    supabase.from("analytics_daily").select("service_id, page_views, referral_clicks, copy_code_count").gte("date", windowStart.toISOString().slice(0, 10)),
    supabase.from("services").select("id, name, slug").eq("status", "active").order("name"),
  ]);

  // サービス別集計
  const serviceStats = new Map<string, { page_views: number; referral_clicks: number; copy_code_count: number }>();
  for (const row of analyticsRows ?? []) {
    const cur = serviceStats.get(row.service_id) ?? { page_views: 0, referral_clicks: 0, copy_code_count: 0 };
    serviceStats.set(row.service_id, {
      page_views: cur.page_views + row.page_views,
      referral_clicks: cur.referral_clicks + row.referral_clicks,
      copy_code_count: cur.copy_code_count + row.copy_code_count,
    });
  }
  const servicesWithStats = (servicesList ?? []).map((s) => ({
    ...s,
    ...(serviceStats.get(s.id) ?? { page_views: 0, referral_clicks: 0, copy_code_count: 0 }),
  })).sort((a, b) => (b.page_views + b.referral_clicks * 2) - (a.page_views + a.referral_clicks * 2));

  const stats = [
    { label: "公開中サービス", value: activeServices ?? 0, href: "/admin/services" },
    { label: "サービス紹介記事", value: introArticles ?? 0, href: "/admin/articles?type=introduction" },
    { label: "関連記事", value: relatedArticles ?? 0, href: "/admin/articles" },
    { label: "審査待ち記事", value: pendingArticles ?? 0, href: "/admin/articles?status=reviewing", alert: (pendingArticles ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-8">ダッシュボード</h1>

      {/* 通知（対応可能なものだけ表示） */}
      {(pendingArticles ?? 0) > 0 && (
        <Link
          href="/admin/articles?status=reviewing"
          className="mb-8 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 hover:bg-yellow-100 transition-colors"
        >
          <span className="text-sm text-yellow-800 font-medium">📝 審査待ち記事が{pendingArticles}件あります</span>
          <span className="text-xs text-yellow-600">確認する →</span>
        </Link>
      )}

      {/* 統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow ${s.alert ? "border-yellow-300" : "border-gray-100"}`}
          >
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
            <p className={`text-sm mt-1 ${s.alert ? "text-yellow-600 font-medium" : "text-gray-500"}`}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* サービス行動明細 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-gray-900">サービス行動明細</h2>
          <div className="flex gap-2">
            {[7, 30].map((d) => (
              <Link
                key={d}
                href={`/admin?days=${d}`}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${days === d ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {d}日
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">サービス</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">PV</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">クリック</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">コピー</th>
              </tr>
            </thead>
            <tbody>
              {servicesWithStats.length === 0 ? (
                <tr><td colSpan={4} className="text-center px-6 py-8 text-gray-400 text-sm">データなし</td></tr>
              ) : (
                servicesWithStats.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <Link href={`/admin/services/${s.id}`} className="hover:text-red-600">{s.name}</Link>
                    </td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.page_views.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.referral_clicks.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.copy_code_count.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/services/new" className="bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors">
            + サービスを追加
          </Link>
          <Link href="/admin/articles?status=reviewing" className="bg-gray-900 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition-colors">
            審査待ち記事を確認
          </Link>
          <Link href="/admin/categories" className="bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            カテゴリ管理
          </Link>
          <Link href="/admin/settings" className="bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            設定
          </Link>
        </div>
      </div>
    </div>
  );
}
