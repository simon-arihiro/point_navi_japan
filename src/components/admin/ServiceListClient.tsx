"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  referral_code: string | null;
  referral_link: string | null;
  bonus_points: number | null;
  bonus_amount: string | null;
  created_at: string;
  categories: CategoryOption[];
  articleCount: number;
  latestPublishedAt: string | null;
  viewCount: number;
};

type Props = {
  services: ServiceRow[];
  allCategories: CategoryOption[];
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP");
}

// 登録時に付与されるポイント・金額を一覧用の短い表示文字列にまとめる
function formatBonus(points: number | null, amount: string | null) {
  const amountText = amount?.trim() || null;
  if (points && amountText) return `${points.toLocaleString()}pt（約${amountText}円）`;
  if (points) return `${points.toLocaleString()}pt`;
  if (amountText) return `約${amountText}円`;
  return null;
}

export default function ServiceListClient({ services, allCategories }: Props) {
  const router = useRouter();
  const [localServices, setLocalServices] = useState(services);
  const [status, setStatus] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localServices
      .filter((s) => {
        if (status && s.status !== status) return false;
        if (categoryIds.length > 0 && !s.categories.some((c) => categoryIds.includes(c.id))) return false;
        if (q && !s.name.toLowerCase().includes(q) && !s.slug.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => (a.status === "inactive" ? 1 : 0) - (b.status === "inactive" ? 1 : 0));
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

  // 「AI記事生成」区画にジャンプする
  const goToAiGenerate = (e: React.MouseEvent, svc: ServiceRow) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/services/${svc.id}#ai-generate`);
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

                <button
                  type="button"
                  onClick={(e) => goToAiGenerate(e, svc)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200 whitespace-nowrap"
                >
                  記事生成
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="text-gray-500">記事 {svc.articleCount}件</span>
              <span className="text-gray-500">閲覧 {svc.viewCount.toLocaleString()}回</span>
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

            {(svc.referral_code || svc.referral_link || formatBonus(svc.bonus_points, svc.bonus_amount)) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formatBonus(svc.bonus_points, svc.bonus_amount) && (
                  <span className="text-xs bg-green-50 text-green-700 font-bold rounded-full px-2.5 py-1">
                    🎁 {formatBonus(svc.bonus_points, svc.bonus_amount)}
                  </span>
                )}
                {svc.referral_code && (
                  <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">招待コードあり</span>
                )}
                {svc.referral_link && (
                  <span className="text-xs bg-orange-50 text-orange-700 rounded-full px-2 py-0.5">招待リンクあり</span>
                )}
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
