import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data: categories }, { data: services }, { data: articles }] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase
      .from("services")
      .select("slug, updated_at, categories:service_categories(category:categories(slug))")
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("articles")
      .select("slug, article_type, updated_at, primary_service:services!articles_primary_service_id_fkey(categories:service_categories(category:categories(slug)))")
      .eq("status", "published")
      .is("deleted_at", null),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/services`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/invitations`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/disclosure`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => ({
    url: `${siteUrl}/services/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = (services ?? []).map((s: any) => ({
    url: `${siteUrl}/services/${s.categories?.[0]?.category?.slug ?? "all"}/${s.slug}`,
    lastModified: s.updated_at,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 紹介記事はサービス詳細ページへリダイレクトされるため除外
  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a: any) => a.article_type !== "introduction")
    .map((a: any) => ({
      url: `${siteUrl}/articles/${a.primary_service?.categories?.[0]?.category?.slug ?? "all"}/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...servicePages, ...articlePages];
}
