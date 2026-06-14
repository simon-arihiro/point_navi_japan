import { createAdminClient } from "@/lib/supabase/server";
import { getServiceArticleViewCounts } from "@/lib/analytics";
import Link from "next/link";
import type { Metadata } from "next";
import ServiceListClient from "@/components/admin/ServiceListClient";
import type { Category, Service } from "@/types/database";

export const metadata: Metadata = { title: "サービス管理" };

interface ServiceQueryRow extends Service {
  categories: { category: Category | null }[] | null;
}

interface ArticleStatRow {
  id: string;
  primary_service_id: string;
  article_type: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default async function AdminServicesPage() {
  const supabase = createAdminClient();

  const [{ data: services }, { data: categories }, { data: articles }, viewCounts] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*))`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .returns<ServiceQueryRow[]>(),
    supabase.from("categories").select("id, name, slug, created_at, updated_at").is("deleted_at", null).order("name").returns<Category[]>(),
    supabase
      .from("articles")
      .select("id, primary_service_id, article_type, status, published_at, created_at")
      .is("deleted_at", null)
      .returns<ArticleStatRow[]>(),
    getServiceArticleViewCounts(supabase),
  ]);

  const articleStats = new Map<string, { count: number; latest: string | null }>();
  const articlesByService = new Map<string, ArticleStatRow[]>();
  for (const a of articles ?? []) {
    const stat = articleStats.get(a.primary_service_id) ?? { count: 0, latest: null };
    stat.count += 1;
    if (a.published_at && (!stat.latest || a.published_at > stat.latest)) stat.latest = a.published_at;
    articleStats.set(a.primary_service_id, stat);

    const list = articlesByService.get(a.primary_service_id) ?? [];
    list.push(a);
    articlesByService.set(a.primary_service_id, list);
  }

  // 紹介・招待は1件のみ存在する想定（archived除く）なので、最新の1件を採用する
  const pickLatest = (list: ArticleStatRow[], type: string) =>
    list
      .filter((a) => a.article_type === type && a.status !== "archived")
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))[0] ?? null;

  const rows = (services ?? []).map((svc) => {
    const stat = articleStats.get(svc.id) ?? { count: 0, latest: null };
    const svcArticles = articlesByService.get(svc.id) ?? [];
    const introductionArticle = pickLatest(svcArticles, "introduction");
    const invitationArticle = pickLatest(svcArticles, "invitation");
    const relatedArticles = svcArticles.filter(
      (a) => a.article_type !== "introduction" && a.article_type !== "invitation" && a.status !== "archived"
    );
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
      bonus_points: svc.bonus_points,
      bonus_amount: svc.bonus_amount,
      created_at: svc.created_at,
      categories: (svc.categories ?? [])
        .map((c) => c.category)
        .filter((c): c is Category => c !== null)
        .map((c) => ({ id: c.id, name: c.name })),
      articleCount: stat.count,
      latestPublishedAt: stat.latest,
      viewCount: viewCounts.get(svc.id) ?? 0,
      introductionArticle: introductionArticle ? { id: introductionArticle.id, status: introductionArticle.status } : null,
      invitationArticle: invitationArticle ? { id: invitationArticle.id, status: invitationArticle.status } : null,
      relatedArticleCount: relatedArticles.length,
      relatedPublishedCount: relatedArticles.filter((a) => a.status === "published").length,
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
