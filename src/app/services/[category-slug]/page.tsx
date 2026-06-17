import { createClient } from "@/lib/supabase/server";
import { getServiceStatsMap } from "@/lib/analytics";
import ServiceCard from "@/components/ServiceCard";
import Sidebar from "@/components/Sidebar";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(props: PageProps<"/services/[category-slug]">): Promise<Metadata> {
  const { "category-slug": categorySlug } = await props.params;
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("name").eq("slug", categorySlug).single();
  return {
    title: cat ? `${cat.name}のサービス一覧` : "カテゴリ",
    description: cat ? `${cat.name}カテゴリのポイ活サービス一覧` : "",
  };
}

export default async function CategoryPage(props: PageProps<"/services/[category-slug]">) {
  const { "category-slug": categorySlug } = await props.params;
  const searchParams = await props.searchParams;
  const sort = searchParams.sort === "copy" ? "copy" : "name";

  // カテゴリ未設定のサービス／記事へのリンクが "all" を仮のカテゴリスラッグとして使うため、
  // 実カテゴリが存在しない "all" はサービス一覧へ誘導する（404防止）
  if (categorySlug === "all") redirect("/services");

  const supabase = await createClient();

  const [catRes, servicesRes, categoriesRes, settingsRes] = await Promise.all([
    supabase.from("categories").select("*").eq("slug", categorySlug).single(),
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
      .eq("status", "active")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("system_settings").select("ranking_window_days").eq("id", 1).single(),
  ]);

  if (!catRes.data) notFound();
  const category = catRes.data;

  let services = (servicesRes.data ?? []).filter((svc: any) =>
    svc.categories?.some((c: any) => c.category?.slug === categorySlug)
  );
  const categories = categoriesRes.data ?? [];

  if (sort === "copy") {
    const windowDays = settingsRes.data?.ranking_window_days ?? 30;
    const statsMap = await getServiceStatsMap(supabase, windowDays);
    services = [...services].sort(
      (a: any, b: any) => (statsMap.get(b.id)?.cc ?? 0) - (statsMap.get(a.id)?.cc ?? 0)
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900">ホーム</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-900">サービス一覧</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-500 text-sm">{services.length}件のサービス</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {/* 並び順 */}
            <div className="flex gap-2 mb-6">
              <Link
                href={`/services/${categorySlug}`}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${sort === "name" ? "bg-brand-400 text-slate-900" : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"}`}
              >
                名前順
              </Link>
              <Link
                href={`/services/${categorySlug}?sort=copy`}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${sort === "copy" ? "bg-brand-400 text-slate-900" : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"}`}
              >
                コピー数が多い順
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc: any) => (
                  <ServiceCard key={svc.id} service={svc} categorySlug={categorySlug} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/library/squirrel-empty-square.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
                <p>このカテゴリにはまだサービスがありません</p>
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
