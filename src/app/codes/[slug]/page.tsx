import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    .select("id, name, slug, logo_url, logo_storage_path, description, referral_code, official_url, catch_copy, bonus_points, bonus_amount, campaign_bonus, categories:service_categories(category:categories(slug, name))")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (!service) notFound();

  // 関連記事（このサービスが主役の公開記事）
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select("id, title, slug, primary_service:services!articles_primary_service_id_fkey(slug, categories:service_categories(category:categories(slug)))")
    .eq("primary_service_id", service.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5);

  const categorySlug = (service.categories as any)?.[0]?.category?.slug ?? "all";

  const faqItems = [
    {
      q: `${service.name}の招待コードとは？`,
      a: `${service.name}の招待コード（紹介コード）とは、新規ユーザーが登録時に入力することで、紹介した人・された人の両方がポイントや特典を受け取れる特別なコードです。上の掲示板に投稿されているコードをコピーして、${service.name}の登録画面で入力してください。`,
    },
    {
      q: `${service.name}の招待コードはどこで入力する？`,
      a: `${service.name}のアプリをインストールして新規登録する際に、招待コード入力欄が表示されます。登録完了後は入力できない場合が多いため、必ず登録前にコードを準備しておきましょう。`,
    },
    {
      q: `招待コードを使うとどんな特典がある？`,
      a: `${service.name}では招待コードを使って登録すると、${service.bonus_amount ? `${service.bonus_amount}円相当のポイントなど` : "ポイントや特典など"}お得なボーナスがもらえます。キャンペーンによって特典内容が変わる場合があるので、最新情報は公式サイトでご確認ください。`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CodeBoard service={service} />

      {/* FAQ セクション */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5">
          よくある質問
        </div>
        <div className="divide-y divide-gray-50">
          {faqItems.map((item, i) => (
            <details key={i} className="group px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-sm font-bold text-gray-800 pr-4">
                  <span className="text-brand-600 mr-2">Q.</span>{item.q}
                </span>
                <svg className="w-4 h-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-6">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* 関連記事 */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5">
            {service.name}の関連記事
          </div>
          <ul className="divide-y divide-gray-50">
            {relatedArticles.map((a) => {
              const artCatSlug = (a.primary_service as any)?.categories?.[0]?.category?.slug ?? "all";
              return (
                <li key={a.id}>
                  <Link
                    href={`/articles/${artCatSlug}/${a.slug}`}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-brand-700 hover:underline line-clamp-1">{a.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 公式サイトへのリンク */}
      {(service as any).official_url && (
        <div className="mt-6 bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">最新の招待コード特典・条件は公式サイトをご確認ください</p>
          <a
            href={(service as any).official_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {service.name} 公式サイトを見る
          </a>
        </div>
      )}
    </>
  );
}
