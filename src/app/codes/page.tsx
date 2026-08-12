import type { Metadata } from "next";
import CodeBoard from "./CodeBoard";

export const metadata: Metadata = {
  title: "ポイ活招待コード掲示板｜紹介コードをみんなでシェア【まとめ】",
  description: "ポイ活アプリの招待コード・紹介コードをユーザーがリアルタイムでシェアする掲示板まとめ。CashwalkやPoint Income・トリマ・モッピーなど人気アプリのコードを無料で検索・コピーできます。新規登録でポイントをもらおう！",
  keywords: ["ポイ活 掲示板", "招待コード 掲示板", "紹介コード 掲示板", "ポイ活 招待コード", "招待コードまとめ", "紹介コード", "招待コード一覧", "フレンドコード"],
  openGraph: {
    title: "ポイ活招待コード掲示板｜紹介コードをみんなでシェア【まとめ】",
    description: "ポイ活アプリの招待コード・紹介コードをユーザーがリアルタイムでシェアする掲示板。人気アプリのコードを無料で検索・コピーできます。",
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
