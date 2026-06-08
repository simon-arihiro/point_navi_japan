import Link from "next/link";
import { Article } from "@/data/articles";

type Props = {
  article: Article;
};

export default function ArticleCard({ article }: Props) {
  const formattedDate = new Date(article.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/tips/${article.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 h-full">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-red-50 text-red-600 font-medium rounded-full px-3 py-1">
              {article.category}
            </span>
            <span className="text-xs text-gray-400">{article.readTime}分で読める</span>
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
