import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConversionArea from "@/components/ConversionArea";
import ArticleCard from "@/components/ArticleCard";
import LogoFallback from "@/components/LogoFallback";
import Sidebar from "@/components/Sidebar";
import TrackView from "@/components/TrackView";
import { renderMarkdown, ARTICLE_PROSE_CLASS } from "@/lib/markdown";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/services/[category-slug]/[service-slug]">
): Promise<Metadata> {
  const { "category-slug": categorySlug, "service-slug": serviceSlug } = await props.params;
  const supabase = await createClient();
  const { data: svc } = await supabase
    .from("services")
    .select("name, description, logo_url, logo_storage_path")
    .eq("slug", serviceSlug)
    .single();
  const ogImage = svc?.logo_storage_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${svc.logo_storage_path}`
    : svc?.logo_url ?? "/mascot/library/poinavi-header-banner-lg.png";
  return {
    title: svc?.name ?? "サービス詳細",
    description: svc?.description ?? "",
    alternates: { canonical: `/services/${categorySlug}/${serviceSlug}` },
    openGraph: {
      type: "website",
      title: svc?.name ?? "サービス詳細",
      description: svc?.description ?? "",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: svc?.name ?? "サービス詳細",
      description: svc?.description ?? "",
      images: [ogImage],
    },
  };
}

export default async function ServicePage(
  props: PageProps<"/services/[category-slug]/[service-slug]">
) {
  const { "category-slug": categorySlug, "service-slug": serviceSlug } = await props.params;
  const supabase = await createClient();

  const [svcRes, introRes, articlesRes, categoriesRes] = await Promise.all([
    supabase
      .from("services")
      .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*)), images:service_images(*)`)
      .eq("slug", serviceSlug)
      .single(),
    supabase
      .from("articles")
      .select("*")
      .eq("article_type", "introduction")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .neq("article_type", "introduction")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!svcRes.data) notFound();
  const service = svcRes.data;
  const categories = categoriesRes.data ?? [];

  // この Service の introduction 記事
  const introArticle = introRes.data?.find((a: any) => a.primary_service_id === service.id);
  const relatedArticles = (articlesRes.data ?? []).filter((a: any) => a.primary_service_id === service.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jp-point-navi.com";
  const categoryName = service.categories?.[0]?.category?.name ?? categorySlug;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "サービス一覧", item: `${siteUrl}/services` },
      { "@type": "ListItem", position: 3, name: categoryName, item: `${siteUrl}/services/${categorySlug}` },
      { "@type": "ListItem", position: 4, name: service.name, item: `${siteUrl}/services/${categorySlug}/${serviceSlug}` },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-slate-900">ホーム</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-900">サービス一覧</Link>
            <span>/</span>
            <Link href={`/services/${categorySlug}`} className="hover:text-slate-900">
              {service.categories?.[0]?.category?.name ?? categorySlug}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/library/squirrel-thumbsup.png" alt="" className="hidden sm:block absolute top-3 right-3 w-12 h-12 lg:w-14 lg:h-14 pointer-events-none select-none" />
              <div className="flex items-start gap-5">
                <LogoFallback
                  name={service.name}
                  logoUrl={service.logo_url}
                  logoStoragePath={service.logo_storage_path}
                  officialUrl={service.official_url}
                  size={64}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-gray-900 mb-1">{service.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.categories?.map((c: any) => (
                      <Link
                        key={c.category?.id}
                        href={`/services/${c.category?.slug}`}
                        className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 hover:bg-brand-50 hover:text-slate-900 transition-colors"
                      >
                        {c.category?.name}
                      </Link>
                    ))}
                    {service.tags?.map((t: any) => (
                      <span key={t.tag?.id} className="text-xs bg-blue-50 text-blue-600 rounded-full px-3 py-1">
                        #{t.tag?.name}
                      </span>
                    ))}
                  </div>
                  {service.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  )}
                  <a
                    href={service.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-slate-900 mt-2 inline-block"
                  >
                    公式サイト →
                  </a>
                </div>
              </div>
            </div>

            {/* Service介绍 コンテンツ */}
            {introArticle && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <article
                  className={ARTICLE_PROSE_CLASS}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(introArticle.content) }}
                />
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{service.name}の関連記事</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map((a: any) => (
                    <ArticleCard key={a.id} article={a} categorySlug={categorySlug} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* Conversion Area */}
            <ConversionArea service={service} />

            {/* 公式サイトリンク */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">公式サイト</h3>
              <a
                href={service.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                公式サイトへ →
              </a>
            </div>

            <Sidebar categories={categories} />
          </div>
        </div>
      </div>

      {/* ページビュートラッキング */}
      <TrackView eventType="service_view" serviceId={service.id} />
    </div>
  );
}
