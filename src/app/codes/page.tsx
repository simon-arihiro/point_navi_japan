import type { Metadata } from "next";
import CodeBoard from "./CodeBoard";

export const metadata: Metadata = {
  title: "招待コード掲示板",
  description: "みんなが投稿した招待コードを検索・コピーできる掲示板です。ポイ活サービスの招待コードをシェアしよう！",
};

type SearchParams = Promise<{ q?: string }>;

export default async function CodesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  return <CodeBoard searchQuery={q} />;
}
