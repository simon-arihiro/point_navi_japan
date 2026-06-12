import { createClient } from "@/lib/supabase/server";
import { calcHotScore, calcProfitScore } from "@/lib/ranking";
import ServiceCard from "@/components/ServiceCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ランキング",
  description: "人気・収益性の高いポイ活サービスランキングです。",
};

export default async function RankingPage(props: PageProps<"/ranking">) {
  const searchParams = await props.searchParams;
  const type = searchParams.type === "profit" ? "profit" : "hot";

  const supabase = await createClient();
  const { data: settings } = await supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single();
  const windowDays = settings?.ranking_window_days ?? 30;
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const [servicesRes, dailyRes] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
      .eq("status", "active"),
    supabase
      .from("analytics_daily")
      .select("service_id, page_views, referral_clicks, copy_code_count")
      .gte("date", windowStart.toISOString().split("T")[0]),
  ]);

  const services = servicesRes.data ?? [];
  const dailyData = dailyRes.data ?? [];

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
    return { ...svc, score: type === "profit" ? calcProfitScore(st.rc, st.cc) : calcHotScore(st.pv, st.rc, st.cc) };
  }).sort((a: any, b: any) => b.score - a.score);

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-4">ランキング</h1>
          <div className="flex gap-2">
            <a
              href="/ranking"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${type === "hot" ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
            >
              🔥 Hot Ranking
            </a>
            <a
              href="/ranking?type=profit"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${type === "profit" ? "bg-brand-warm-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
            >
              💰 Profit Ranking
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {ranked.length > 0 ? (
          <div className="space-y-3">
            {ranked.map((svc: any, i: number) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                categorySlug={svc.categories?.[0]?.category?.slug}
                rank={i + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/poinavi-kun.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
            <p>ランキングデータはまだありません</p>
          </div>
        )}
        <p className="text-xs text-center text-gray-400 mt-8">
          ※直近{windowDays}日間のデータをもとに集計しています
        </p>
      </div>
    </div>
  );
}
