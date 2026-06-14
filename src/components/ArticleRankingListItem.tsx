import Link from "next/link";
import { ArticleWithService } from "@/types/database";
import LogoFallback from "./LogoFallback";

type Props = {
  article: ArticleWithService;
  categorySlug?: string;
};

// サイドバー用のコンパクトな記事ランキング行
export default function ArticleRankingListItem({ article, categorySlug }: Props) {
  const cat = categorySlug ?? "all";
  const href = `/articles/${cat}/${article.slug}`;

  return (
    <Link href={href} className="group flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-xl hover:bg-brand-50/60 transition-colors">
      <LogoFallback
        name={article.primary_service?.name ?? "?"}
        logoUrl={article.primary_service?.logo_url}
        logoStoragePath={article.primary_service?.logo_storage_path}
        officialUrl={article.primary_service?.official_url}
        size={36}
      />
      <p className="min-w-0 flex-1 text-sm text-gray-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
        {article.title}
      </p>
    </Link>
  );
}
