import { createClient } from "@/lib/supabase/server";
import ArticleListWithFilter from "@/components/ArticleListWithFilter";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "招待コード・紹介コードの使い方、モッピー・トリマ・freecashなど人気ポイ活アプリの攻略法や比較レビューをまとめて紹介。実際に使ってみたお得な始め方・裏ワザを解説しています。",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const supabase = await createClient();

  const [articlesRes, categoriesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*, primary_service:services!articles_primary_service_id_fkey(name, slug, logo_url, logo_storage_path, official_url)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase.from("categories").select("*").order("name"),
  ]);

  const articles = (articlesRes.data ?? []).filter((a: any) => a.primary_service);
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">記事一覧</h1>
          <p className="text-gray-500 text-sm">招待コード・紹介コードの使い方からポイ活アプリの攻略・比較まで、実際に使ってみたレビューをまとめて紹介。お得な始め方や裏ワザをチェックしよう。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <ArticleListWithFilter articles={articles} />
          </div>

          <aside>
            <Sidebar categories={categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}
