import Link from "next/link";
import { ArticleWithService } from "@/types/database";

type Props = {
  article: ArticleWithService;
  categorySlug?: string;
};

const TYPE_LABEL: Record<string, string> = {
  introduction: "サービス紹介",
  guide: "使い方ガイド",
  faq: "よくある質問",
  comparison: "比較",
  campaign: "キャンペーン",
  earnings: "収益実績",
};

export default function ArticleCard({ article, categorySlug }: Props) {
  const svc = article.primary_service as any;
  const cat = categorySlug ?? svc?.categories?.[0]?.category?.slug ?? "all";
  const href = `/articles/${cat}/${article.slug}`;
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("ja-JP")
    : "";

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-red-50 text-red-600 font-medium rounded-full px-3 py-1">
            {TYPE_LABEL[article.article_type] ?? article.article_type}
          </span>
          {article.primary_service && (
            <span className="text-xs text-gray-500">{article.primary_service.name}</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
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
