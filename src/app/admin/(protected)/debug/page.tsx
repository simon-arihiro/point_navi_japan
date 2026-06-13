import { createAdminClient } from "@/lib/supabase/server";
import CopyButton from "@/components/admin/CopyButton";
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
    .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // ログ調査時に分かりやすいよう、created_atを日本時間(JST)の文字列に変換して併記する
  const toJst = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "medium" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">デバッグ: 記事データ確認</h1>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">articles（embedなし）</h2>
          <CopyButton text={JSON.stringify({ data: raw.data, error: raw.error }, null, 2)} />
        </div>
        <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
          {JSON.stringify({ data: raw.data, error: raw.error }, null, 2)}
        </pre>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">articles（primary_service embedあり）</h2>
          <CopyButton text={JSON.stringify({ data: embedded.data, error: embedded.error }, null, 2)} />
        </div>
        <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
          {JSON.stringify({ data: embedded.data, error: embedded.error }, null, 2)}
        </pre>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">admin_notifications（直近10件）</h2>
        {notifications.error && (
          <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
            {JSON.stringify({ error: notifications.error }, null, 2)}
          </pre>
        )}
        <div className="space-y-3">
          {(notifications.data ?? []).map((item) => (
            <div key={item.id} className="relative bg-gray-50 rounded-xl p-4">
              <div className="absolute top-2 right-2">
                <CopyButton text={JSON.stringify(item, null, 2)} />
              </div>
              <p className="text-xs font-bold text-gray-500 mb-2 pr-20">{toJst(item.created_at)} (JST)</p>
              <pre className="text-xs overflow-auto whitespace-pre-wrap pr-20">{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
