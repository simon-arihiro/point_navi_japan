import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ダッシュボード" };

export default async function AdminDashboard() {
  const supabase = await createAdminClient();

  const [
    { count: activeServices },
    { count: introArticles },
    { count: relatedArticles },
    { count: pendingArticles },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("article_type", "introduction").eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).neq("article_type", "introduction").eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).in("status", ["draft", "reviewing"]),
    supabase.from("admin_notifications").select("*").eq("is_read", false).order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "公開中サービス", value: activeServices ?? 0, href: "/admin/services" },
    { label: "サービス紹介記事", value: introArticles ?? 0, href: "/admin/articles?type=introduction" },
    { label: "関連記事", value: relatedArticles ?? 0, href: "/admin/articles" },
    { label: "審査待ち記事", value: pendingArticles ?? 0, href: "/admin/articles?status=draft", alert: (pendingArticles ?? 0) > 0 },
  ];

  const notifTypeLabel: Record<string, string> = {
    article_pending: "📝 審査待ち記事あり",
    ai_failed: "⚠️ AI生成エラー",
    image_failed: "🖼️ 画像取得エラー",
    distribution_failed: "📡 配信エラー",
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-8">ダッシュボード</h1>

      {/* 通知 */}
      {(notifications ?? []).length > 0 && (
        <div className="mb-8 space-y-2">
          {(notifications ?? []).map((n: any) => (
            <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-yellow-800">{notifTypeLabel[n.type] ?? n.type}</span>
              <span className="text-xs text-yellow-600">{new Date(n.created_at).toLocaleString("ja-JP")}</span>
            </div>
          ))}
        </div>
      )}

      {/* 統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      {/* クイックアクション */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/services/new" className="bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors">
            + サービスを追加
          </Link>
          <Link href="/admin/articles?status=draft" className="bg-gray-900 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition-colors">
            審査待ち記事を確認
          </Link>
          <Link href="/admin/settings" className="bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            設定
          </Link>
        </div>
      </div>
    </div>
  );
}
