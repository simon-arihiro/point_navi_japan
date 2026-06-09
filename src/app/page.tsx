import { createClient } from "@/lib/supabase/server";
import { calcHotScore, calcProfitScore } from "@/lib/ranking";
import ServiceCard from "@/components/ServiceCard";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

export default async function HomePage() {
  let hotServices: any[] = [];
  let profitServices: any[] = [];
  let latestArticles: any[] = [];

  try {
    const supabase = await createClient();
    const { data: settings } = await supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single();
    const windowDays = settings?.ranking_window_days ?? 30;
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - windowDays);

    const [servicesRes, dailyRes, articlesRes] = await Promise.all([
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
        .select("*, primary_service:services(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6),
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

    hotServices = [...ranked].sort((a, b) => b.hotScore - a.hotScore).slice(0, 8);
    profitServices = [...ranked].sort((a, b) => b.profitScore - a.profitScore).slice(0, 8);
    latestArticles = articlesRes.data ?? [];
  } catch {
    // Supabase 未接続時は空表示
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-red-200 text-sm font-medium uppercase tracking-widest mb-4">日本のポイ活・招待コードをナビゲート</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              正直なところ、<br />
              <span className="text-yellow-300">これは本当におすすめ</span><br />
              のサービスだけ集めました
            </h1>
            <p className="text-red-100 text-lg leading-relaxed mb-8">
              実際に使ってみた体験をもとに、ポイ活サービスの招待コード・招待リンクをまとめています。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services" className="bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors">
                サービス一覧を見る
              </Link>
              <Link href="/ranking" className="bg-red-700 text-white font-bold px-6 py-3 rounded-xl border border-red-400 hover:bg-red-600 transition-colors">
                ランキングを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Ranking */}
      {hotServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-red-600 text-xs font-semibold uppercase tracking-wider mb-1">人気ランキング</p>
              <h2 className="text-2xl font-black text-gray-900">Hot Ranking 🔥</h2>
            </div>
            <Link href="/ranking" className="text-red-600 font-medium text-sm hover:underline">すべて見る →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotServices.slice(0, 4).map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Profit Ranking */}
      {profitServices.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider mb-1">収益性ランキング</p>
                <h2 className="text-2xl font-black text-gray-900">Profit Ranking 💰</h2>
              </div>
              <Link href="/ranking?type=profit" className="text-orange-600 font-medium text-sm hover:underline">すべて見る →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {profitServices.slice(0, 4).map((svc, i) => (
                <ServiceCard key={svc.id} service={svc} categorySlug={svc.categories?.[0]?.category?.slug} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">新着</p>
              <h2 className="text-2xl font-black text-gray-900">最新記事</h2>
            </div>
            <Link href="/articles" className="text-red-600 font-medium text-sm hover:underline">すべて見る →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestArticles.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {hotServices.length === 0 && latestArticles.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-4xl mb-4">🚀</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">準備中です</h2>
          <p className="text-gray-500">管理者がサービスを追加するとここに表示されます。</p>
        </section>
      )}
    </div>
  );
}
