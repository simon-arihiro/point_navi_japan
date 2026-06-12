"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoFallback from "@/components/LogoFallback";

type Props = {
  autoFocus?: boolean;
  onNavigate?: () => void;
};

const RESULT_LIMIT = 5;

export default function SearchBox({ autoFocus, onNavigate }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setServices([]);
      setArticles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const q = `%${query}%`;
      const [svcRes, artRes] = await Promise.all([
        supabase
          .from("services")
          .select(`*, categories:service_categories(category:categories(*))`)
          .eq("status", "active")
          .or(`name.ilike.${q},description.ilike.${q}`)
          .limit(RESULT_LIMIT),
        supabase
          .from("articles")
          .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, categories:service_categories(category:categories(*)))")
          .eq("status", "published")
          .neq("article_type", "introduction")
          .or(`title.ilike.${q},description.ilike.${q}`)
          .limit(RESULT_LIMIT),
      ]);
      setServices(svcRes.data ?? []);
      setArticles(artRes.data ?? []);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = services.length > 0 || articles.length > 0;

  const goToFullResults = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onNavigate?.();
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToFullResults();
        }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="サービス名・キーワードで検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocus}
            aria-label="検索"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="検索キーワードをクリア"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {query.trim() && (
        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {loading && <p className="text-gray-400 text-sm py-2">検索中...</p>}

          {!loading && !hasResults && (
            <p className="text-gray-400 text-sm py-2">「{query}」の検索結果はありません</p>
          )}

          {services.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-400 mb-1">サービス</p>
              <div className="space-y-1">
                {services.map((svc) => (
                  <Link
                    key={svc.id}
                    href={`/services/${svc.categories?.[0]?.category?.slug ?? "all"}/${svc.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-xl hover:bg-amber-50/60 transition-colors"
                  >
                    <LogoFallback
                      name={svc.name}
                      logoUrl={svc.logo_url}
                      logoStoragePath={svc.logo_storage_path}
                      officialUrl={svc.official_url}
                      size={32}
                    />
                    <span className="min-w-0 flex-1 text-sm font-bold text-gray-900 truncate">{svc.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-400 mb-1">記事</p>
              <div className="space-y-1">
                {articles.map((a) => (
                  <Link
                    key={a.id}
                    href={`/articles/${a.primary_service?.categories?.[0]?.category?.slug ?? "all"}/${a.slug}`}
                    onClick={onNavigate}
                    className="block py-1.5 px-2 -mx-2 rounded-xl hover:bg-amber-50/60 transition-colors text-sm text-gray-700 line-clamp-1"
                  >
                    {a.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasResults && (
            <button
              type="button"
              onClick={goToFullResults}
              className="block w-full text-center text-amber-700 font-medium text-sm hover:underline pt-2 border-t border-gray-50"
            >
              すべての結果を見る →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
