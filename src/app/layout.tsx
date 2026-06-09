import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "ポイ活ナビ | 日本の招待コード・ポイントサービス比較",
    template: "%s | ポイ活ナビ",
  },
  description: "日本のポイ活・招待コード情報を徹底ナビゲート。実際に使った正直な感想と招待コード・招待リンクをまとめています。",
  keywords: "ポイ活, 招待コード, 招待リンク, ポイントサービス, トリマ, Powl, モッピー",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // カテゴリ・最新記事をサーバーで取得してヘッダー・フッターへ渡す
  let categories: any[] = [];
  let latestArticles: any[] = [];

  try {
    const supabase = await createClient();
    const [catsRes, articlesRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("articles")
        .select("id, title, slug, article_type, published_at, primary_service:services(name, slug, categories:service_categories(category:categories(*)))")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5),
    ]);
    categories = catsRes.data ?? [];
    latestArticles = articlesRes.data ?? [];
  } catch {
    // Supabase 未接続時は空で表示
  }

  return (
    <html lang="ja" className={notoSansJP.className}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Header categories={categories} />
        <main>{children}</main>
        <Footer categories={categories} latestArticles={latestArticles} />
      </body>
    </html>
  );
}
