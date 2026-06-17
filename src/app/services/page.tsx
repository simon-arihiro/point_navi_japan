import { createClient } from "@/lib/supabase/server";
import { getServiceStatsMap } from "@/lib/analytics";
import ServiceCard from "@/components/ServiceCard";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サービス一覧",
  description: "日本のお得なポイ活サービス一覧です。",
  // ?sort=copy などのクエリ付きURLも正規URLへ統合し重複コンテンツ化を防ぐ
  alternates: { canonical: "/services" },
};

export default async function ServicesPage(props: PageProps<"/services">) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort === "copy" ? "copy" : "name";

  const supabase = await createClient();

  const [servicesRes, categoriesRes, settingsRes] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*))`)
      .eq("status", "active")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single(),
  ]);

  const categories = categoriesRes.data ?? [];
  const windowDays = settingsRes.data?.ranking_window_days ?? 30;

  let services = servicesRes.data ?? [];
  if (sort === "copy") {
    const statsMap = await getServiceStatsMap(supabase, windowDays);
    services = [...services].sort(
      (a: any, b: any) => (statsMap.get(b.id)?.cc ?? 0) - (statsMap.get(a.id)?.cc ?? 0)
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">サービス一覧</h1>
          <p className="text-gray-500 text-sm">実際に使ってみたポイ活サービス</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {/* カテゴリフィルター */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Link href="/services" className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium">
                すべて
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/services/${cat.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm hover:border-brand-300 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* 並び順 */}
            <div className="flex gap-2 mb-8">
              <Link
                href="/services"
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${sort === "name" ? "bg-brand-400 text-slate-900" : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"}`}
              >
                名前順
              </Link>
              <Link
                href="/services?sort=copy"
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${sort === "copy" ? "bg-brand-400 text-slate-900" : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"}`}
              >
                コピー数が多い順
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc: any) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    categorySlug={svc.categories?.[0]?.category?.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/library/squirrel-empty-square.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
                <p>サービスはまだ登録されていません</p>
              </div>
            )}
          </div>

          <aside>
            <Sidebar categories={categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}
