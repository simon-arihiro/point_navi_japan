import Link from "next/link";
import { ArticleWithService } from "@/types/database";
import LogoFallback from "./LogoFallback";
import HighlightServiceName from "./HighlightServiceName";
import { extractFirstImageUrl } from "@/lib/markdown";
import { getArticleTypeLabel, getArticleTypeBadgeClass } from "@/lib/articleTypes";

type Props = {
  article: ArticleWithService;
  categorySlug?: string;
  size?: "sm" | "lg" | "featured";
};

export default function ArticleCard({ article, categorySlug, size = "sm" }: Props) {
  const svc = article.primary_service as any;
  const cat = categorySlug ?? svc?.categories?.[0]?.category?.slug ?? "all";
  const href = `/articles/${cat}/${article.slug}`;
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("ja-JP")
    : "";

  if (size === "featured") {
    // featured_image_url → 本文内の最初の画像 → サービスロゴ の順でフォールバック
    const thumbnailUrl =
      (article as any).featured_image_url ||
      extractFirstImageUrl(article.content) ||
      (svc?.logo_storage_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${svc.logo_storage_path}`
        : svc?.logo_url) ||
      null;

    return (
      <Link href={href} className="group block h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md hover:border-brand-200 transition-all h-full">
          <div className="flex items-center gap-4 mb-3">
            <LogoFallback
              name={article.primary_service?.name ?? "?"}
              logoUrl={article.primary_service?.logo_url}
              logoStoragePath={article.primary_service?.logo_storage_path}
              officialUrl={article.primary_service?.official_url}
              size={48}
            />
            <h3 className="font-black text-gray-900 text-lg sm:text-xl leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-w-0">
              <HighlightServiceName title={article.title} serviceName={article.primary_service?.name} />
            </h3>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-40 sm:w-48 aspect-video shrink-0 rounded-xl bg-gray-50 overflow-hidden">
              {thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {article.description && (
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-2">{article.description}</p>
              )}
              {publishedDate && <p className="text-xs text-gray-400">{publishedDate}</p>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (size === "lg") {
    return (
      <Link href={href} className="group block h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all h-full">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback
              name={article.primary_service?.name ?? "?"}
              logoUrl={article.primary_service?.logo_url}
              logoStoragePath={article.primary_service?.logo_storage_path}
              officialUrl={article.primary_service?.official_url}
              size={36}
            />
            {article.primary_service?.name && (
              <span className="text-sm text-gray-500 truncate">{article.primary_service.name}</span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 mb-2">
            <HighlightServiceName title={article.title} serviceName={article.primary_service?.name} />
          </h3>
          {article.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{article.description}</p>
          )}
          {publishedDate && <p className="text-xs text-gray-400">{publishedDate}</p>}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all h-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          {article.primary_service && (
            <div className="flex items-center gap-2 min-w-0">
              <LogoFallback
                name={article.primary_service.name}
                logoUrl={article.primary_service.logo_url}
                logoStoragePath={article.primary_service.logo_storage_path}
                officialUrl={article.primary_service.official_url}
                size={24}
              />
              <span className="text-xs text-gray-500 truncate">{article.primary_service.name}</span>
            </div>
          )}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${getArticleTypeBadgeClass(article.article_type)}`}>
            {getArticleTypeLabel(article.article_type)}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 mb-2">
          <HighlightServiceName title={article.title} serviceName={article.primary_service?.name} />
        </h3>
        {article.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{article.description}</p>
        )}
        {publishedDate && (
          <p className="text-xs text-gray-400">{publishedDate}</p>
        )}
      </div>
    </Link>
  );
}
