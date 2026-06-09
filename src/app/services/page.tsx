import { createClient } from "@/lib/supabase/server";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サービス一覧",
  description: "ポイ活・招待コードが使える日本のサービス一覧です。",
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*))`)
      .eq("status", "active")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  const services = servicesRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">サービス一覧</h1>
          <p className="text-gray-500 text-sm">招待コード・招待リンクが使えるポイ活サービス</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/services" className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium">
            すべて
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/services/${cat.slug}`}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm hover:border-red-300 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <p className="text-4xl mb-4">📋</p>
            <p>サービスはまだ登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}
