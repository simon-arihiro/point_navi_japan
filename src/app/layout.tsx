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
  applicationName: "ポイナビ",
  publisher: "ポイナビ",
  title: {
    default: "りすくんのポイナビ｜招待コード・ポイ活アプリを正直レビュー",
    template: "%s | ポイナビ",
  },
  description: "招待コード・お得な入会特典を実際に試した体験談をもとに正直レビュー。トリマ・Powl・モッピーなど人気ポイ活アプリの始め方・稼ぎ方をりすくんがわかりやすく解説。",
  keywords: "ポイ活, 招待コード, 招待リンク, ポイントサービス, トリマ, Powl, モッピー",
  openGraph: {
    type: "website",
    siteName: "ポイナビ",
    locale: "ja_JP",
    title: "りすくんのポイナビ｜招待コード・ポイ活アプリを正直レビュー",
    description: "招待コード・お得な入会特典を実際に試した体験談をもとに正直レビュー。トリマ・Powl・モッピーなど人気ポイ活アプリの始め方・稼ぎ方をりすくんがわかりやすく解説。",
    images: ["/mascot/library/poinavi-header-banner-lg.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "りすくんのポイナビ｜招待コード・ポイ活アプリを正直レビュー",
    description: "招待コード・お得な入会特典を実際に試した体験談をもとに正直レビュー。",
    images: ["/mascot/library/poinavi-header-banner-lg.png"],
  },
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jp-point-navi.com";
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ポイナビ",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ポイナビ",
    url: siteUrl,
    logo: `${siteUrl}/mascot/library/poinavi-header-banner-lg.png`,
  };

  return (
    <html lang="ja" className={notoSansJP.className}>
      <head>
        <GoogleAnalytics />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3207349828641600" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <SiteChrome categories={categories}>{children}</SiteChrome>
      </body>
    </html>
  );
}
