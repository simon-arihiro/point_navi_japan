import { createClient } from "@/lib/supabase/server";
import ServiceCard from "@/components/ServiceCard";
import { notFound } from "next/navigation";
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
  const supabase = await createClient();

  const [catRes, servicesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("slug", categorySlug).single(),
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*))`)
      .eq("status", "active"),
  ]);

  if (!catRes.data) notFound();
  const category = catRes.data;

  const services = (servicesRes.data ?? []).filter((svc: any) =>
    svc.categories?.some((c: any) => c.category?.slug === categorySlug)
  );

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
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((svc: any) => (
              <ServiceCard key={svc.id} service={svc} categorySlug={categorySlug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p>このカテゴリにはまだサービスがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
