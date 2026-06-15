import { createClient } from "@/lib/supabase/server";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import ConversionArea from "@/components/ConversionArea";
import ArticleCard from "@/components/ArticleCard";
import HighlightServiceName from "@/components/HighlightServiceName";
import { SearchCard, CategoryCard } from "@/components/Sidebar";
import TrackView from "@/components/TrackView";
import { renderMarkdown, ARTICLE_PROSE_CLASS } from "@/lib/markdown";
import { getArticleViewCountsForIds } from "@/lib/analytics";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/articles/[category-slug]/[article-slug]">
): Promise<Metadata> {
  const { "article-slug": articleSlug } = await props.params;
  const supabase = await createClient();
  const { data: a } = await supabase.from("articles").select("title, description").eq("slug", articleSlug).single();
  return { title: a?.title ?? "記事", description: a?.description ?? "" };
}

export default async function ArticlePage(
  props: PageProps<"/articles/[category-slug]/[article-slug]">
) {
  const { "category-slug": categorySlug, "article-slug": articleSlug } = await props.params;
  const supabase = await createClient();

  const [articleRes, categoriesRes] = await Promise.all([
    supabase
      .from("articles")
      .select(`*, primary_service:services!articles_primary_service_id_fkey(*, categories:service_categories(category:categories(*))), related_services:article_services(service_id)`)
      .eq("slug", articleSlug)
      .eq("status", "published")
      .single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  const article = articleRes.data;
  const categories = categoriesRes.data ?? [];

  if (!article) notFound();

  // 紹介記事はサービス詳細ページに統合表示しているため、そちらへ恒久リダイレクト（重複コンテンツ防止）
  if (article.article_type === "introduction") {
    const targetCategorySlug = article.primary_service?.categories?.[0]?.category?.slug ?? "all";
    const targetServiceSlug = article.primary_service?.slug;
    if (targetServiceSlug) permanentRedirect(`/services/${targetCategorySlug}/${targetServiceSlug}`);
    notFound();
  }

  // 関連記事：1番目は本サービスの紹介記事、2〜5番目は本サービスの他記事（PV降順）、
  // 続いて手動で関連付けたサービスの記事（PV降順）、残りは他サービスの記事（紹介記事含む、PV降順）で最大10件まで埋める
  const RELATED_LIMIT = 10;
  const OWN_OTHERS_LIMIT = 4;
  const relatedServiceIds = (article.related_services ?? []).map((r: { service_id: string }) => r.service_id);

  const [{ data: introArticle }, { data: ownOthers }, { data: comparedArticles }, { data: otherArticles }] = await Promise.all([
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .eq("primary_service_id", article.primary_service_id)
      .eq("status", "published")
      .eq("article_type", "introduction")
      .maybeSingle(),
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .eq("primary_service_id", article.primary_service_id)
      .eq("status", "published")
      .neq("id", article.id)
      .neq("article_type", "introduction"),
    relatedServiceIds.length > 0
      ? supabase
          .from("articles")
          .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
          .in("primary_service_id", relatedServiceIds)
          .eq("status", "published")
          .order("published_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .neq("primary_service_id", article.primary_service_id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
  ]);

  const candidateIds = [...(ownOthers ?? []), ...(comparedArticles ?? []), ...(otherArticles ?? [])].map((a) => a.id);
  const viewCounts = await getArticleViewCountsForIds(supabase, candidateIds);
  const byPvDesc = (a: { id: string }, b: { id: string }) => (viewCounts.get(b.id) ?? 0) - (viewCounts.get(a.id) ?? 0);

  const sortedOwnOthers = [...(ownOthers ?? [])].sort(byPvDesc);
  const sortedComparedArticles = [...(comparedArticles ?? [])].sort(byPvDesc);
  const sortedOtherArticles = [...(otherArticles ?? [])]
    .filter((a) => !relatedServiceIds.includes(a.primary_service_id))
    .sort(byPvDesc);

  const related = [
    ...(introArticle ? [introArticle] : []),
    ...sortedOwnOthers.slice(0, OWN_OTHERS_LIMIT),
    ...sortedComparedArticles,
    ...sortedOtherArticles,
  ]
    .filter((a) => a.primary_service)
    .slice(0, RELATED_LIMIT);

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const service = article.primary_service;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-slate-900">ホーム</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-slate-900">記事</Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 記事本文 */}
          <article className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {service && (
                <Link
                  href={`/services/${categorySlug}/${service.slug}`}
                  className="text-xs text-gray-500 hover:text-slate-900"
                >
                  {service.name}
                </Link>
              )}
              {publishedDate && <span className="text-xs text-gray-400">{publishedDate}</span>}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-6">
              <HighlightServiceName title={article.title} serviceName={article.primary_service?.name} />
            </h1>

            {article.description && (
              <div className="bg-brand-50 border-l-4 border-brand-400 rounded-r-xl p-4 mb-8">
                <p className="text-gray-700 text-sm leading-relaxed">{article.description}</p>
              </div>
            )}

            <div
              className={ARTICLE_PROSE_CLASS}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
            />

            <p className="text-xs text-gray-400 mt-10 pt-6 border-t border-gray-100">
              ※本記事の情報は参考目的です。最新情報は各サービスの公式サイトをご確認ください。
            </p>

            <div className="flex items-center gap-3 mt-6 bg-brand-50 rounded-2xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/library/squirrel-waving-happy-sparkle.png" alt="" className="w-14 h-14 shrink-0" />
              <p className="text-sm text-gray-700">
                最後まで読んでくれてありがとう！気になるサービスはサイドバーからチェックしてみてね。
              </p>
            </div>
          </article>

          {/* サイドバー */}
          <aside className="space-y-6">
            <SearchCard />

            {service && (
              <div className="lg:sticky lg:top-[116px]">
                <ConversionArea service={service} />
              </div>
            )}

            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">関連記事</h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <ArticleCard key={r.id} article={r} categorySlug={categorySlug} />
                  ))}
                </div>
              </div>
            )}

            <CategoryCard categories={categories} />
          </aside>
        </div>
      </div>

      {/* ページビュートラッキング */}
      <TrackView eventType="article_view" articleId={article.id} serviceId={article.primary_service_id} />
    </div>
  );
}
