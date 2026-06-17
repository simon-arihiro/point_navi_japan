import { createClient } from "@/lib/supabase/server";
import { getServiceStatsMap, getArticleViewCounts } from "@/lib/analytics";
import ArticleCard from "@/components/ArticleCard";
import RankingListItem from "@/components/RankingListItem";
import ArticleRankingListItem from "@/components/ArticleRankingListItem";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  let popularServices: any[] = [];
  let popularArticles: any[] = [];
  let latestArticles: any[] = [];
  let categories: any[] = [];

  try {
    const supabase = await createClient();
    const { data: settings } = await supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single();
    const windowDays = settings?.ranking_window_days ?? 30;

    const [servicesRes, articlesRes, categoriesRes, statsMap, articleViewCounts] = await Promise.all([
      supabase
        .from("services")
        .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
        .eq("status", "active"),
      supabase
        .from("articles")
        .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      getServiceStatsMap(supabase, windowDays),
      getArticleViewCounts(supabase),
    ]);

    const services = servicesRes.data ?? [];
    const articles = (articlesRes.data ?? []).filter((a: any) => a.primary_service);

    const rankedServices = services.map((svc: any) => ({ ...svc, pv: statsMap.get(svc.id)?.pv ?? 0 }));
    popularServices = [...rankedServices].sort((a, b) => b.pv - a.pv).slice(0, 5);

    // 人気記事ランキングは紹介記事も含めた全記事のpvで集計する
    const rankedArticles = articles.map((a: any) => ({ ...a, pv: articleViewCounts.get(a.id) ?? 0 }));
    popularArticles = [...rankedArticles].sort((a, b) => b.pv - a.pv).slice(0, 10);

    // 最新記事フィードはサービス詳細に統合表示される紹介記事を除く
    latestArticles = articles.filter((a: any) => a.article_type !== "introduction").slice(0, 7);
    categories = categoriesRes.data ?? [];
  } catch {
    // Supabase 未接続時は空表示
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-brand-warm-50 to-brand-100 text-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="max-w-3xl">
            <p className="text-brand-700 text-sm font-medium uppercase tracking-widest mb-4">日本のポイ活情報をナビゲート</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              正直なところ、<br />
              <span className="text-brand-warm-600">これは本当におすすめ</span><br />
              のサービスだけ集めた
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              実際に使ってみた体験をもとに、お得なポイ活サービスをわかりやすく紹介しています。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                サービス一覧を見る
              </Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/library/squirrel-postman-points-delivery.png"
            alt="ポイナビくん"
            className="hidden sm:block w-56 md:w-72 lg:w-80 xl:w-96 h-auto shrink-0 mx-auto md:mx-0"
          />
        </div>
      </section>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最新記事 */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">新着</p>
                <h2 className="text-2xl font-black text-gray-900">最新記事</h2>
              </div>
              <Link href="/articles" className="text-brand-700 font-medium text-sm hover:underline">すべて見る →</Link>
            </div>

            {latestArticles.length > 0 ? (
              <div className="space-y-4">
                {latestArticles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} size="featured" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/library/squirrel-empty-square.png" alt="" className="w-24 h-auto mx-auto mb-2 opacity-90" />
                <p className="text-sm">記事はまだありません</p>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            <Sidebar categories={categories} />

            {/* 人気サービスランキング */}
            {popularServices.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-1">
                  人気サービスランキング <span className="animate-flame">🔥</span>
                </h2>
                <div className="divide-y divide-gray-50">
                  {popularServices.map((svc, i) => (
                    <RankingListItem key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 人気記事ランキング */}
            {popularArticles.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-1">
                  人気記事ランキング <span className="animate-flame">🔥</span>
                </h2>
                <div className="divide-y divide-gray-50">
                  {popularArticles.map((article) => (
                    <ArticleRankingListItem key={article.id} article={article} />
                  ))}
                </div>
                <Link href="/articles" className="block text-center text-brand-warm-600 font-medium text-sm hover:underline mt-3 pt-3 border-t border-gray-50">
                  記事をすべて見る →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
