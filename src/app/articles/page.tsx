import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "ポイ活サービスの使い方・攻略・比較記事一覧です。",
};

const TYPE_FILTERS = [
  { value: undefined, label: "すべて" },
  { value: "introduction", label: "紹介" },
  { value: "related", label: "関連" },
] as const;

export default async function ArticlesPage(props: PageProps<"/articles">) {
  const searchParams = await props.searchParams;
  const typeFilter = searchParams.type as string | undefined;

  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  if (typeFilter === "introduction") query = query.eq("article_type", "introduction");
  else if (typeFilter === "related") query = query.neq("article_type", "introduction");

  const { data: articles } = await query;

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">記事一覧</h1>
          <p className="text-gray-500 text-sm">ポイ活サービスの使い方・攻略・比較記事</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タイプフィルター */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/articles?type=${f.value}` : "/articles"}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {(articles ?? []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(articles ?? []).map((a: any) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📝</p>
            <p>記事はまだありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
