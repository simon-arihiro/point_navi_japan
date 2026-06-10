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
  const [status, setStatus] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (status && s.status !== status) return false;
      if (categoryIds.length > 0 && !s.categories.some((c) => categoryIds.includes(c.id))) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [services, status, categoryIds, query]);

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

      <p className="text-xs text-gray-400 mb-3">{filtered.length} / {services.length} 件</p>

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
              <span className="text-gray-300 shrink-0">›</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className={`font-medium rounded-full px-2.5 py-1 ${svc.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {svc.status}
              </span>
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
