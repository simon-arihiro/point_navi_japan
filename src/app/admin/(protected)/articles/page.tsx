import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ArticleListClient from "@/components/admin/ArticleListClient";
import RefreshInvitationTitlesButton from "@/components/admin/RefreshInvitationTitlesButton";
import type { Category } from "@/types/database";

export const metadata: Metadata = { title: "記事管理" };

interface ArticleQueryRow {
  id: string;
  title: string;
  article_type: string;
  status: string;
  created_at: string;
  published_at: string | null;
  primary_service: {
    name: string;
    logo_url: string | null;
    logo_storage_path: string | null;
    official_url: string;
    categories: { category: Category | null }[] | null;
  } | null;
}

export default async function AdminArticlesPage() {
  const supabase = createAdminClient();

  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase
      .from("articles")
      .select(
        `id, title, article_type, status, created_at, published_at,
        primary_service:services!articles_primary_service_id_fkey(
          name, logo_url, logo_storage_path, official_url,
          categories:service_categories(category:categories(*))
        )`
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<ArticleQueryRow[]>(),
    supabase.from("categories").select("id, name, slug, created_at, updated_at").is("deleted_at", null).order("name").returns<Category[]>(),
  ]);

  const rows = (articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    article_type: a.article_type,
    status: a.status,
    created_at: a.created_at,
    published_at: a.published_at,
    primary_service: a.primary_service
      ? {
          name: a.primary_service.name,
          logo_url: a.primary_service.logo_url,
          logo_storage_path: a.primary_service.logo_storage_path,
          official_url: a.primary_service.official_url,
          categories: (a.primary_service.categories ?? [])
            .map((c) => c.category)
            .filter((c): c is Category => c !== null)
            .map((c) => ({ id: c.id, name: c.name })),
        }
      : null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">記事管理</h1>
        <RefreshInvitationTitlesButton />
      </div>

      <ArticleListClient articles={rows} allCategories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
