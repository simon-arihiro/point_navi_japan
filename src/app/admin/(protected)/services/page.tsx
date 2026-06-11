import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import ServiceListClient from "@/components/admin/ServiceListClient";
import type { Category, Service } from "@/types/database";

export const metadata: Metadata = { title: "サービス管理" };

interface ServiceQueryRow extends Service {
  categories: { category: Category | null }[] | null;
}

interface ArticleStatRow {
  primary_service_id: string;
  published_at: string | null;
}

export default async function AdminServicesPage() {
  const supabase = createAdminClient();

  const [{ data: services }, { data: categories }, { data: articles }] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*))`)
      .order("created_at", { ascending: false })
      .returns<ServiceQueryRow[]>(),
    supabase.from("categories").select("id, name, slug, created_at, updated_at").order("name").returns<Category[]>(),
    supabase.from("articles").select("primary_service_id, published_at").returns<ArticleStatRow[]>(),
  ]);

  const articleStats = new Map<string, { count: number; latest: string | null }>();
  for (const a of articles ?? []) {
    const stat = articleStats.get(a.primary_service_id) ?? { count: 0, latest: null };
    stat.count += 1;
    if (a.published_at && (!stat.latest || a.published_at > stat.latest)) stat.latest = a.published_at;
    articleStats.set(a.primary_service_id, stat);
  }

  const rows = (services ?? []).map((svc) => {
    const stat = articleStats.get(svc.id) ?? { count: 0, latest: null };
    return {
      id: svc.id,
      name: svc.name,
      slug: svc.slug,
      status: svc.status,
      logo_url: svc.logo_url,
      logo_storage_path: svc.logo_storage_path,
      official_url: svc.official_url,
      referral_code: svc.referral_code,
      referral_link: svc.referral_link,
      created_at: svc.created_at,
      categories: (svc.categories ?? [])
        .map((c) => c.category)
        .filter((c): c is Category => c !== null)
        .map((c) => ({ id: c.id, name: c.name })),
      articleCount: stat.count,
      latestPublishedAt: stat.latest,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">サービス管理</h1>
        <Link href="/admin/services/new" className="bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors">
          + 新規追加
        </Link>
      </div>

      <ServiceListClient services={rows} allCategories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
