import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "記事管理" };

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  approved: "bg-indigo-100 text-indigo-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

export default async function AdminArticlesPage(props: PageProps<"/admin/articles">) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status as string | undefined;
  const typeFilter = searchParams.type as string | undefined;

  const supabase = createAdminClient();
  let query = supabase
    .from("articles")
    .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (statusFilter) query = query.eq("status", statusFilter);
  if (typeFilter) query = query.eq("article_type", typeFilter);

  const { data: articles } = await query;

  const filters = [
    { label: "すべて", href: "/admin/articles" },
    { label: "審査待ち", href: "/admin/articles?status=draft" },
    { label: "reviewing", href: "/admin/articles?status=reviewing" },
    { label: "公開中", href: "/admin/articles?status=published" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">記事管理</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <a
            key={f.href}
            href={f.href}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              (statusFilter ? f.href.includes(statusFilter) : f.href === "/admin/articles")
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">タイトル</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">種別</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">ステータス</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">作成日</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(articles ?? []).map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.primary_service?.name ?? "—"}</p>
                </td>
                <td className="px-3 py-4">
                  <span className="text-xs text-gray-600">{a.article_type}</span>
                </td>
                <td className="px-3 py-4">
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_BADGE[a.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </td>
                <td className="px-3 py-4 text-right">
                  <Link href={`/admin/articles/${a.id}`} className="text-sm text-red-600 hover:underline">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(articles ?? []).length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">記事はありません</div>
        )}
      </div>
    </div>
  );
}
