"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ServiceCard from "@/components/ServiceCard";
import ArticleCard from "@/components/ArticleCard";

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [services, setServices] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setServices([]);
      setArticles([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const q = `%${query}%`;
      const [svcRes, artRes] = await Promise.all([
        supabase
          .from("services")
          .select(`*, categories:service_categories(category:categories(*))`)
          .eq("status", "active")
          .or(`name.ilike.${q},description.ilike.${q}`)
          .limit(12),
        supabase
          .from("articles")
          .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug)")
          .eq("status", "published")
          .neq("article_type", "introduction")
          .or(`title.ilike.${q},description.ilike.${q}`)
          .limit(9),
      ]);
      setServices(svcRes.data ?? []);
      setArticles(artRes.data ?? []);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="戻る"
              className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-black text-gray-900">検索</h1>
          </div>
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="サービス名・キーワードで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-gray-400 text-sm">検索中...</p>}

        {!loading && query && services.length === 0 && articles.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/poinavi-kun.png" alt="" className="w-28 sm:w-36 h-auto mx-auto mb-4 opacity-90" />
            <p className="text-sm mb-4">「{query}」の検索結果はありません</p>
            <Link href="/services" className="text-brand-700 font-medium text-sm hover:underline">
              サービス一覧を見る →
            </Link>
          </div>
        )}

        {services.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">サービス ({services.length}件)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((svc) => (
                <ServiceCard key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} />
              ))}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">関連記事 ({articles.length}件)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
