import Link from "next/link";
import { ArticleWithService } from "@/types/database";
import LogoFallback from "./LogoFallback";
import { ARTICLE_TYPE_LABEL, ARTICLE_TYPE_ICON } from "@/lib/articleTypes";

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
  const typeLabel = ARTICLE_TYPE_LABEL[article.article_type] ?? article.article_type;
  const typeIcon = ARTICLE_TYPE_ICON[article.article_type] ?? "📝";

  if (size === "featured") {
    return (
      <Link href={href} className="group block h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-amber-200 transition-all h-full flex flex-col">
          <div className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center gap-4">
            <LogoFallback
              name={article.primary_service?.name ?? "?"}
              logoUrl={article.primary_service?.logo_url}
              logoStoragePath={article.primary_service?.logo_storage_path}
              officialUrl={article.primary_service?.official_url}
              size={48}
            />
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-bold rounded-full px-3 py-1 mb-1">
                {typeIcon} {typeLabel}
              </span>
              {article.primary_service?.name && (
                <p className="text-xs text-gray-500 truncate">{article.primary_service.name}</p>
              )}
            </div>
          </div>
          <div className="p-5 sm:p-6 flex-1">
            <h3 className="font-black text-gray-900 text-lg sm:text-xl leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h3>
            {article.description && (
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-3">{article.description}</p>
            )}
            {publishedDate && <p className="text-xs text-gray-400">{publishedDate}</p>}
          </div>
        </div>
      </Link>
    );
  }

  if (size === "lg") {
    return (
      <Link href={href} className="group block h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-amber-200 transition-all h-full">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback
              name={article.primary_service?.name ?? "?"}
              logoUrl={article.primary_service?.logo_url}
              logoStoragePath={article.primary_service?.logo_storage_path}
              officialUrl={article.primary_service?.official_url}
              size={36}
            />
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 font-medium rounded-full px-3 py-1">
                {typeIcon} {typeLabel}
              </span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
            {article.title}
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-amber-50 text-amber-700 font-medium rounded-full px-3 py-1">
            {typeLabel}
          </span>
          {article.primary_service && (
            <span className="text-xs text-gray-500">{article.primary_service.name}</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
          {article.title}
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
