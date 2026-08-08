import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CodeBoard from "../CodeBoard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: service } = await supabase
    .from("services")
    .select("name")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!service) return { title: "招待コード掲示板まとめ" };

  return {
    title: `${service.name}の招待コード・紹介コード掲示板まとめ｜最新コードをゲット`,
    description: `${service.name}の招待コード・紹介コードを投稿・検索できる掲示板まとめ。新規登録でポイントがもらえる最新コードを探そう！コピーしてお得に始めよう。`,
    keywords: [`${service.name}`, `${service.name} 招待コード`, `${service.name} 紹介コード`, "招待コード掲示板", "ポイ活"],
    openGraph: {
      title: `${service.name}の招待コード・紹介コード掲示板まとめ`,
      description: `${service.name}の最新招待コードを検索・コピーできます。新規登録でポイントがもらえるお得なコードを探そう！`,
      type: "website",
      url: `https://jp-point-navi.com/codes/${slug}`,
    },
    alternates: {
      canonical: `https://jp-point-navi.com/codes/${slug}`,
    },
  };
}

export default async function ServiceBoardPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: service } = await supabase
    .from("services")
    .select("id, name, slug, logo_url, logo_storage_path, description, referral_code")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${service.name}の招待コード・紹介コード掲示板まとめ`,
    "description": `${service.name}の招待コード・紹介コードを投稿・検索できる掲示板。新規登録でポイントがもらえる最新コードをコピーして活用しよう。`,
    "url": `https://jp-point-navi.com/codes/${slug}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://jp-point-navi.com" },
        { "@type": "ListItem", "position": 2, "name": "招待コード掲示板まとめ", "item": "https://jp-point-navi.com/codes" },
        { "@type": "ListItem", "position": 3, "name": `${service.name} 招待コード`, "item": `https://jp-point-navi.com/codes/${slug}` },
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CodeBoard service={service} />
    </>
  );
}
