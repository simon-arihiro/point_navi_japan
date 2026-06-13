import { createClient } from "@/lib/supabase/server";
import { calcHotScore, calcProfitScore } from "@/lib/ranking";
import { getServiceStatsMap } from "@/lib/analytics";
import ArticleCard from "@/components/ArticleCard";
import RankingListItem from "@/components/RankingListItem";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function HomePage() {
  let hotServices: any[] = [];
  let profitServices: any[] = [];
  let latestArticles: any[] = [];
  let categories: any[] = [];

  try {
    const supabase = await createClient();
    const { data: settings } = await supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single();
    const windowDays = settings?.ranking_window_days ?? 30;

    const [servicesRes, articlesRes, categoriesRes, statsMap] = await Promise.all([
      supabase
        .from("services")
        .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
        .eq("status", "active"),
      supabase
        .from("articles")
        .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
        .eq("status", "published")
        .neq("article_type", "introduction")
        .order("published_at", { ascending: false })
        .limit(7),
      supabase.from("categories").select("*").order("name"),
      getServiceStatsMap(supabase, windowDays),
    ]);

    const services = servicesRes.data ?? [];

    const ranked = services.map((svc: any) => {
      const st = statsMap.get(svc.id) ?? { pv: 0, rc: 0, cc: 0 };
      return { ...svc, hotScore: calcHotScore(st.pv, st.rc, st.cc), profitScore: calcProfitScore(st.rc, st.cc) };
    });

    hotServices = [...ranked].sort((a, b) => b.hotScore - a.hotScore).slice(0, 5);
    profitServices = [...ranked].sort((a, b) => b.profitScore - a.profitScore).slice(0, 5);
    latestArticles = articlesRes.data ?? [];
    categories = categoriesRes.data ?? [];
  } catch {
    // Supabase 未接続時は空表示
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-brand-warm-50 to-brand-100 text-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
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
              <Link href="/ranking" className="bg-brand-400 text-slate-900 font-bold px-6 py-3 rounded-xl border border-brand-300 hover:bg-brand-500 transition-colors">
                ランキングを見る
              </Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/poinavi-kun.png"
            alt="ポイナビくん"
            className="hidden sm:block w-48 md:w-56 lg:w-72 h-auto shrink-0 mx-auto md:mx-0"
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
                <img src="/mascot/poinavi-kun.png" alt="" className="w-24 h-auto mx-auto mb-2 opacity-90" />
                <p className="text-sm">記事はまだありません</p>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            <Sidebar categories={categories} />

            {/* 人気ランキング */}
            {hotServices.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="mb-1">
                  <p className="text-brand-700 text-xs font-semibold uppercase tracking-wider">人気ランキング</p>
                  <h2 className="text-lg font-black text-gray-900">Hot Ranking 🔥</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {hotServices.map((svc, i) => (
                    <RankingListItem key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
                  ))}
                </div>
                <Link href="/ranking" className="block text-center text-brand-700 font-medium text-sm hover:underline mt-3 pt-3 border-t border-gray-50">
                  ランキングをすべて見る →
                </Link>
              </div>
            )}

            {/* 収益性ランキング */}
            {profitServices.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="mb-1">
                  <p className="text-brand-warm-600 text-xs font-semibold uppercase tracking-wider">収益性ランキング</p>
                  <h2 className="text-lg font-black text-gray-900">Profit Ranking 💰</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {profitServices.map((svc, i) => (
                    <RankingListItem key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
                  ))}
                </div>
                <Link href="/ranking?type=profit" className="block text-center text-brand-warm-600 font-medium text-sm hover:underline mt-3 pt-3 border-t border-gray-50">
                  ランキングをすべて見る →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
