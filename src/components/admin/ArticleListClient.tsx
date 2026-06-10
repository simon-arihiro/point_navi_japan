"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LogoFallback from "@/components/LogoFallback";
import MultiSelectFilter from "@/components/admin/MultiSelectFilter";
import { getArticleTypeLabel, getArticleTypeIcon, getArticleTypeBadgeClass, getArticleStatusLabel } from "@/lib/articleTypes";

type CategoryOption = { id: string; name: string };

type ArticleRow = {
  id: string;
  title: string;
  article_type: string;
  status: string;
  created_at: string;
  published_at: string | null;
  primary_service: {
    name: string;
    logo_url: string | null;
    logo_storage_path: string | null;
    official_url: string;
    categories: CategoryOption[];
  } | null;
};

type Props = {
  articles: ArticleRow[];
  allCategories: CategoryOption[];
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP");
}

export default function ArticleListClient({ articles, allCategories }: Props) {
  const [localArticles, setLocalArticles] = useState(articles);
  const [status, setStatus] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localArticles.filter((a) => {
      if (status === "published" && a.status !== "published") return false;
      if (status === "reviewing" && a.status === "published") return false;
      if (categoryIds.length > 0 && !(a.primary_service?.categories ?? []).some((c) => categoryIds.includes(c.id))) return false;
      if (q && !a.title.toLowerCase().includes(q) && !(a.primary_service?.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [localArticles, status, categoryIds, query]);

  // ステータスをワンクリックで「公開中」⇔「審査待ち」に切り替え
  const handleToggleStatus = async (e: React.MouseEvent, article: ArticleRow) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId) return;

    const nextStatus = article.status === "published" ? "reviewing" : "published";
    setTogglingId(article.id);

    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setLocalArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a)));
    }
    setTogglingId(null);
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">検索</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・サービス名"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">すべて</option>
            <option value="published">公開中</option>
            <option value="reviewing">審査待ち</option>
          </select>
        </div>
        <MultiSelectFilter
          label="カテゴリ"
          options={allCategories.map((c) => ({ value: c.id, label: c.name }))}
          selected={categoryIds}
          onChange={setCategoryIds}
          placeholder="すべてのカテゴリ"
        />
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} / {localArticles.length} 件</p>

      <div className="space-y-3">
        {filtered.map((a) => (
          <Link
            key={a.id}
            href={`/admin/articles/${a.id}`}
            className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <LogoFallback
                name={a.primary_service?.name ?? "?"}
                logoUrl={a.primary_service?.logo_url}
                logoStoragePath={a.primary_service?.logo_storage_path}
                officialUrl={a.primary_service?.official_url ?? ""}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-snug break-words line-clamp-2">{a.title}</h3>
                <p className="text-xs text-gray-400 truncate">{a.primary_service?.name ?? "—"}</p>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-24">
                <button
                  type="button"
                  onClick={(e) => handleToggleStatus(e, a)}
                  disabled={togglingId === a.id}
                  title={a.status === "published" ? "クリックで審査待ちに戻す" : "クリックで公開する"}
                  className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                    a.status === "published"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${a.status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
                  {getArticleStatusLabel(a.status)}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${getArticleTypeBadgeClass(a.article_type)}`}>
                {getArticleTypeIcon(a.article_type)} {getArticleTypeLabel(a.article_type)}
              </span>
              <span className="text-gray-400">作成: {formatDate(a.created_at)}</span>
              {a.published_at && <span className="text-gray-400">公開: {formatDate(a.published_at)}</span>}
            </div>

            {(a.primary_service?.categories ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {a.primary_service!.categories.map((c) => (
                  <span key={c.id} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            条件に一致する記事がありません
          </div>
        )}
      </div>
    </div>
  );
}
