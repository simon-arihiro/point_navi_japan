import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { createClient } from "@/lib/supabase/server";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ポイナビ | 日本のポイ活サービス比較・体験レビュー",
    template: "%s | ポイナビ",
  },
  description: "日本のポイ活サービスを実際に使ってみた正直な感想や活用方法をわかりやすくまとめています。",
  keywords: "ポイ活, 招待コード, 招待リンク, ポイントサービス, トリマ, Powl, モッピー",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // カテゴリをサーバーで取得してヘッダーへ渡す
  let categories: any[] = [];

  try {
    const supabase = await createClient();
    const catsRes = await supabase.from("categories").select("*").order("name");
    categories = catsRes.data ?? [];
  } catch {
    // Supabase 未接続時は空で表示
  }

  return (
    <html lang="ja" className={notoSansJP.className}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <GoogleAnalytics />
        <SiteChrome categories={categories}>{children}</SiteChrome>
      </body>
    </html>
  );
}
