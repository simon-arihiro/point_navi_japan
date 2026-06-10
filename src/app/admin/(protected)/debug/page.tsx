import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "デバッグ" };

// 一時的な調査用ページ：記事データの不整合（dashboard件数 vs 一覧表示）を切り分けるため、
// embedなし/ありのクエリ結果と通知の生データをそのまま表示する。
export default async function AdminDebugPage() {
  const supabase = createAdminClient();

  const raw = await supabase
    .from("articles")
    .select("id, title, slug, status, article_type, primary_service_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const embedded = await supabase
    .from("articles")
    .select("*, primary_service:services(name, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">デバッグ: 記事データ確認</h1>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">articles（embedなし）</h2>
        <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
          {JSON.stringify({ data: raw.data, error: raw.error }, null, 2)}
        </pre>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">articles（primary_service embedあり）</h2>
        <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
          {JSON.stringify({ data: embedded.data, error: embedded.error }, null, 2)}
        </pre>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">admin_notifications（直近10件）</h2>
        <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
          {JSON.stringify({ data: notifications.data, error: notifications.error }, null, 2)}
        </pre>
      </section>
    </div>
  );
}
