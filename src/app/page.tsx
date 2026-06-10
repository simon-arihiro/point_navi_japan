import { createClient } from "@/lib/supabase/server";
import { calcHotScore, calcProfitScore } from "@/lib/ranking";
import ArticleCard from "@/components/ArticleCard";
import RankingListItem from "@/components/RankingListItem";
import Mascot from "@/components/Mascot";
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
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - windowDays);

    const [servicesRes, dailyRes, articlesRes, categoriesRes] = await Promise.all([
      supabase
        .from("services")
        .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
        .eq("status", "active"),
      supabase
        .from("analytics_daily")
        .select("service_id, page_views, referral_clicks, copy_code_count")
        .gte("date", windowStart.toISOString().split("T")[0]),
      supabase
        .from("articles")
        .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(7),
      supabase.from("categories").select("*").order("name").limit(8),
    ]);

    const services = servicesRes.data ?? [];
    const dailyData = dailyRes.data ?? [];

    // サービス別集計
    const statsMap = new Map<string, { pv: number; rc: number; cc: number }>();
    for (const row of dailyData) {
      const s = statsMap.get(row.service_id) ?? { pv: 0, rc: 0, cc: 0 };
      s.pv += row.page_views;
      s.rc += row.referral_clicks;
      s.cc += row.copy_code_count;
      statsMap.set(row.service_id, s);
    }

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

  const [featuredArticle, ...gridArticles] = latestArticles;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-3xl">
            <p className="text-amber-700 text-sm font-medium uppercase tracking-widest mb-4">日本のポイ活・招待コードをナビゲート</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              正直なところ、<br />
              <span className="text-orange-600">これは本当におすすめ</span><br />
              のサービスだけ集めました
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              実際に使ってみた体験をもとに、ポイ活サービスの招待コード・招待リンクをまとめています。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                サービス一覧を見る
              </Link>
              <Link href="/ranking" className="bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl border border-amber-300 hover:bg-amber-500 transition-colors">
                ランキングを見る
              </Link>
            </div>
          </div>
          <Mascot className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-56 h-56 opacity-90" />
        </div>
      </section>

      {/* メインコンテンツ */}
      {(latestArticles.length > 0 || hotServices.length > 0) ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 最新記事 */}
            <div className="lg:col-span-2">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">新着</p>
                  <h2 className="text-2xl font-black text-gray-900">最新記事</h2>
                </div>
                <Link href="/articles" className="text-amber-700 font-medium text-sm hover:underline">すべて見る →</Link>
              </div>

              {latestArticles.length > 0 ? (
                <div className="space-y-4">
                  <ArticleCard article={featuredArticle} size="featured" />
                  {gridArticles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gridArticles.map((article: any) => (
                        <ArticleCard key={article.id} article={article} size="lg" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm">記事はまだありません</p>
                </div>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 人気ランキング */}
              {hotServices.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="mb-1">
                    <p className="text-amber-700 text-xs font-semibold uppercase tracking-wider">人気ランキング</p>
                    <h2 className="text-lg font-black text-gray-900">Hot Ranking 🔥</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {hotServices.map((svc, i) => (
                      <RankingListItem key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
                    ))}
                  </div>
                  <Link href="/ranking" className="block text-center text-amber-700 font-medium text-sm hover:underline mt-3 pt-3 border-t border-gray-50">
                    ランキングをすべて見る →
                  </Link>
                </div>
              )}

              {/* 収益性ランキング */}
              {profitServices.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="mb-1">
                    <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">収益性ランキング</p>
                    <h2 className="text-lg font-black text-gray-900">Profit Ranking 💰</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {profitServices.map((svc, i) => (
                      <RankingListItem key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
                    ))}
                  </div>
                  <Link href="/ranking?type=profit" className="block text-center text-orange-600 font-medium text-sm hover:underline mt-3 pt-3 border-t border-gray-50">
                    ランキングをすべて見る →
                  </Link>
                </div>
              )}

              {/* カテゴリーから探す */}
              {categories.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-black text-gray-900 text-sm mb-3">カテゴリーから探す</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/services/${c.slug}`}
                        className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1.5 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-4xl mb-4">🚀</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">準備中です</h2>
          <p className="text-gray-500">管理者がサービスを追加するとここに表示されます。</p>
        </section>
      )}
    </div>
  );
}
