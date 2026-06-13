import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "ポイ活サービスの使い方・攻略・比較記事一覧です。",
};

export default async function ArticlesPage() {
  const supabase = await createClient();

  const [articlesRes, categoriesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .eq("status", "published")
      .neq("article_type", "introduction")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase.from("categories").select("*").order("name"),
  ]);

  const articles = articlesRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">記事一覧</h1>
          <p className="text-gray-500 text-sm">ポイ活サービスの使い方・攻略・比較記事</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((a: any) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/poinavi-kun.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
                <p>記事はまだありません</p>
              </div>
            )}
          </div>

          <aside>
            <Sidebar categories={categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}
