import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "ポイ活サービスの使い方・攻略・比較記事一覧です。",
};

const TYPE_LABEL: Record<string, string> = {
  introduction: "サービス紹介",
  guide: "使い方ガイド",
  faq: "よくある質問",
  comparison: "比較",
  campaign: "キャンペーン",
  earnings: "収益実績",
};

export default async function ArticlesPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("*, primary_service:services(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

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
          {Object.entries(TYPE_LABEL).map(([type, label]) => (
            <Link
              key={type}
              href={`/articles?type=${type}`}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs hover:border-amber-300 transition-colors"
            >
              {label}
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
