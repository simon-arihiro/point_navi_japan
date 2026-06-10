"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LogoFallback from "@/components/LogoFallback";
import MultiSelectFilter from "@/components/admin/MultiSelectFilter";

type CategoryOption = { id: string; name: string };

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  official_url: string;
  created_at: string;
  categories: CategoryOption[];
  articleCount: number;
  latestPublishedAt: string | null;
};

type Props = {
  services: ServiceRow[];
  allCategories: CategoryOption[];
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP");
}

export default function ServiceListClient({ services, allCategories }: Props) {
  const [localServices, setLocalServices] = useState(services);
  const [status, setStatus] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localServices.filter((s) => {
      if (status && s.status !== status) return false;
      if (categoryIds.length > 0 && !s.categories.some((c) => categoryIds.includes(c.id))) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [localServices, status, categoryIds, query]);

  // ステータスの有効/無効をワンクリックで切り替え
  const handleToggleStatus = async (e: React.MouseEvent, svc: ServiceRow) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId) return;

    const nextStatus = svc.status === "active" ? "inactive" : "active";
    setTogglingId(svc.id);

    const res = await fetch(`/api/services/${svc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setLocalServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, status: nextStatus } : s)));
    }
    setTogglingId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const closeMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(null);
  };

  const handleUpdateIntro = async (e: React.MouseEvent, svc: ServiceRow) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(null);
    setActionLoadingId(svc.id);

    const res = await fetch("/api/ai/generate-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: svc.id }),
    });

    setActionLoadingId(null);
    alert(res.ok ? `「${svc.name}」の紹介記事を更新しました` : "紹介記事の更新に失敗しました");
  };

  const handleAddRelatedArticle = async (e: React.MouseEvent, svc: ServiceRow) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(null);
    setActionLoadingId(svc.id);

    const res = await fetch("/api/ai/generate-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: svc.id }),
    });

    setActionLoadingId(null);
    alert(res.ok ? `「${svc.name}」の関連記事を追加しました` : "関連記事の追加に失敗しました");
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
            placeholder="サービス名・スラッグ"
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
            <option value="active">active</option>
            <option value="inactive">inactive</option>
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

      <p className="text-xs text-gray-400 mb-3">{filtered.length} / {localServices.length} 件</p>

      <div className="space-y-3">
        {filtered.map((svc) => (
          <Link
            key={svc.id}
            href={`/admin/services/${svc.id}`}
            className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <LogoFallback
                name={svc.name}
                logoUrl={svc.logo_url}
                logoStoragePath={svc.logo_storage_path}
                officialUrl={svc.official_url}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-snug break-words">{svc.name}</h3>
                <p className="text-xs text-gray-400">{svc.slug}</p>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-24">
                <button
                  type="button"
                  onClick={(e) => handleToggleStatus(e, svc)}
                  disabled={togglingId === svc.id}
                  title={svc.status === "active" ? "クリックで非公開にする" : "クリックで公開する"}
                  className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                    svc.status === "active"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${svc.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                  {svc.status === "active" ? "公開中" : "非公開"}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => toggleMenu(e, svc.id)}
                    disabled={actionLoadingId === svc.id}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200 disabled:opacity-50 whitespace-nowrap"
                  >
                    {actionLoadingId === svc.id ? "更新中..." : "記事生成"}
                  </button>

                  {menuOpenId === svc.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={closeMenu} />
                      <div className="absolute right-0 top-full mt-1.5 w-24 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={(e) => handleUpdateIntro(e, svc)}
                          className="block w-full text-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          紹介記事
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAddRelatedArticle(e, svc)}
                          className="block w-full text-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                          関連記事
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="text-gray-500">記事 {svc.articleCount}件</span>
              <span className="text-gray-400">追加: {formatDate(svc.created_at)}</span>
              <span className="text-gray-400">更新: {formatDate(svc.latestPublishedAt)}</span>
            </div>

            {svc.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {svc.categories.map((c) => (
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
            条件に一致するサービスがありません
          </div>
        )}
      </div>
    </div>
  );
}
