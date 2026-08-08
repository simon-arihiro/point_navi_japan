import type { Metadata } from "next";
import CodeBoard from "./CodeBoard";

export const metadata: Metadata = {
  title: "招待コード掲示板まとめ｜ポイ活サービスの紹介コードをシェア",
  description: "CashwalkやPoint Income、おちぽなどポイ活アプリの招待コード掲示板まとめ！招待コード・紹介コードを投稿・検索できます。新規登録でポイントがもらえるお得なコードをコピーして活用しよう！",
  keywords: ["招待コード", "紹介コード", "掲示板", "ポイ活", "招待コードまとめ", "フレンドコード", "招待コード一覧"],
  openGraph: {
    title: "招待コード掲示板まとめ｜ポイ活サービスの紹介コードをシェア",
    description: "CashwalkやPoint Incomeなどポイ活アプリの招待コードを投稿・検索！新規登録でポイントがもらえるお得なコードを探そう。",
    type: "website",
    url: "https://jp-point-navi.com/codes",
  },
  alternates: {
    canonical: "https://jp-point-navi.com/codes",
  },
};

type SearchParams = Promise<{ q?: string }>;

export default async function CodesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "招待コード掲示板まとめ",
    "description": "ポイ活サービスの招待コード・紹介コードを投稿・検索できる掲示板。CashwalkやPoint Incomeなど人気アプリのコードをシェアしよう。",
    "url": "https://jp-point-navi.com/codes",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://jp-point-navi.com" },
        { "@type": "ListItem", "position": 2, "name": "招待コード掲示板まとめ", "item": "https://jp-point-navi.com/codes" },
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CodeBoard searchQuery={q} />
    </>
  );
}
