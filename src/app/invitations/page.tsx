import { createClient } from "@/lib/supabase/server";
import InvitationCard from "@/components/InvitationCard";
import InvitationCodeTable from "@/components/InvitationCodeTable";
import SearchBox from "@/components/SearchBox";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return {
    title: `【${yearMonth}最新】ポイ活アプリの招待コードおすすめ一覧｜新規登録で特典ゲット`,
    description: `${yearMonth}更新。ポイ活・副業アプリの招待コードをまとめて比較。tiktok・チャデポ・Cashwalk・ンポポなど人気サービスの招待コードを一覧表で紹介。新規登録ボーナスで最大数千円相当のポイントがもらえます。`,
    alternates: { canonical: "/invitations" },
    keywords: ["招待コード", "紹介コード", "ポイ活", "招待コード一覧", "ポイ活アプリ 招待コード", "紹介コード おすすめ", "新規登録 特典"],
    openGraph: {
      title: `【${yearMonth}最新】ポイ活アプリの招待コードおすすめ一覧`,
      description: "人気ポイ活アプリの招待コードをまとめて比較。新規登録で特典ゲット！",
      type: "website",
    },
  };
}

const faqItems = [
  {
    q: "招待コードとは何ですか？",
    a: "招待コード（紹介コード）とは、ポイ活アプリなどに新規登録する際に入力することで、登録者と紹介者の両方が特典（ポイント・ボーナス）を受け取れる特別なコードです。多くのサービスで数百〜数千円相当のボーナスがもらえます。",
  },
  {
    q: "招待コードはどこで入力しますか？",
    a: "通常はアプリの新規会員登録画面、またはアカウント設定の「招待コード入力」「紹介コード入力」欄から入力できます。登録後に入力できるサービスもありますが、登録前の入力を求めるサービスもあるため、事前に確認しておきましょう。",
  },
  {
    q: "招待コードを使うとどんな特典がもらえますか？",
    a: "サービスによって異なりますが、ポイント付与・現金相当ボーナス・特別キャンペーン参加権などが主な特典です。例えばtiktokでは最大5,000円相当、チャデポでは登録ボーナスなど、各サービスの特典をこのページの一覧表でご確認ください。",
  },
  {
    q: "招待コードは無料で使えますか？",
    a: "はい、招待コードの利用は完全無料です。アプリに登録するだけで特典が受け取れます。ただし、各サービスの利用規約に従って正しく使用してください。",
  },
  {
    q: "招待コードが使えない場合はどうすればいいですか？",
    a: "招待コードには有効期限がある場合や、キャンペーン終了で無効になる場合があります。使えない場合は、このページ下部の「掲示板」でユーザーが共有している最新コードをお試しください。",
  },
];

export default async function InvitationsPage() {
  const supabase = await createClient();

  const { data: recentPosts } = await supabase
    .from("code_submissions")
    .select("nickname, referral_code, created_at, service:services(name, slug)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  const { data } = await supabase
    .from("articles")
    .select(`*, primary_service:services!articles_primary_service_id_fkey(*, categories:service_categories(category:categories(*)))`)
    .eq("article_type", "invitation")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = data ?? [];

  const codeRows = articles
    .filter((a: any) => a.primary_service)
    .map((a: any) => {
      const svc = a.primary_service;
      const catSlug = svc.categories?.[0]?.category?.slug ?? "all";
      return {
        id: svc.id,
        name: svc.name,
        logoUrl: svc.logo_url,
        logoStoragePath: svc.logo_storage_path,
        officialUrl: svc.official_url,
        referralCode: svc.referral_code,
        href: `/articles/${catSlug}/${a.slug}`,
      };
    });

  const now = new Date();
  const yearMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://jp-point-navi.com/invitations",
        "url": "https://jp-point-navi.com/invitations",
        "name": `【${yearMonth}最新】ポイ活アプリの招待コードおすすめ一覧`,
        "description": "ポイ活・副業アプリの招待コードを一覧で比較。新規登録で特典ゲット。",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://jp-point-navi.com/" },
            { "@type": "ListItem", "position": 2, "name": "招待コードおすすめ一覧", "item": "https://jp-point-navi.com/invitations" },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div>
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
              <div>
                <p className="text-xs text-gray-400 mb-1">ホーム &gt; 招待コードおすすめ一覧</p>
                <h1 className="text-3xl font-black text-gray-900 mb-2">🎁 招待コードおすすめ一覧</h1>
                <p className="text-gray-500 text-sm">ポイ活・副業アプリの招待コードを比較表でまとめてご紹介。新規登録で特典ゲット！</p>
              </div>
              <div className="w-full lg:w-80 shrink-0">
                <p className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  サービス名で探す
                </p>
                <SearchBox />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* リード文 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-black text-gray-900 text-base mb-3">📖 このページについて</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              このページでは、<strong>ポイ活・副業アプリの招待コード</strong>を特典額付きの比較表でまとめています。
              新規登録時に招待コードを入力するだけで、数百〜数千円相当のポイントやボーナスがもらえます。
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              掲載しているコードは実際に登録して特典を受け取れたものを厳選しています。
              tiktok・チャデポ・Cashwalk・ンポポ・カウシェファームなど、人気サービスの最新招待コードを随時更新中です。
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["招待コード", "紹介コード", "ポイ活", "新規登録特典", "無料でポイント", "副業アプリ"].map((tag) => (
                <span key={tag} className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-bold">{tag}</span>
              ))}
            </div>
          </div>

          {/* コード一覧表 */}
          <h2 className="font-black text-gray-900 text-base mb-3">📋 招待コードおすすめ一覧表（{yearMonth}最新）</h2>
          <InvitationCodeTable rows={codeRows} />

          {/* 掲示板への誘導バナー */}
          <a
            href="/codes"
            className="block bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-4 hover:bg-amber-100 transition-colors mt-3 mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl shrink-0">💬</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm">コードが使えない・最新コードを探している方へ</p>
                <p className="text-xs text-gray-600 mt-0.5">掲示板ではユーザーが最新の招待コードをリアルタイムでシェアしています。</p>
              </div>
              <span className="text-amber-600 font-black text-sm shrink-0">掲示板を見る →</span>
            </div>
            {recentPosts && recentPosts.length > 0 && (
              <div className="border-t border-amber-200 pt-3 space-y-1.5">
                {recentPosts.map((post: any, i: number) => {
                  const svc = post.service as { name: string; slug: string } | null;
                  const relTime = (() => {
                    const diff = Date.now() - new Date(post.created_at).getTime();
                    const h = Math.floor(diff / 3600000);
                    const d = Math.floor(diff / 86400000);
                    if (h < 1) return "たった今";
                    if (h < 24) return `${h}時間前`;
                    return `${d}日前`;
                  })();
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="text-amber-500 shrink-0">▸</span>
                      <span className="font-bold text-gray-800 shrink-0">{svc?.name ?? "不明"}</span>
                      <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0">{post.referral_code}</span>
                      <span className="text-gray-400 shrink-0">{post.nickname}</span>
                      <span className="text-gray-400 ml-auto shrink-0">{relTime}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </a>

          {/* サービス別招待コードカード */}
          <h2 className="font-black text-gray-900 text-base mb-4">🏆 サービス別・招待コード詳細ガイド</h2>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {articles.filter((a: any) => a.primary_service).map((a: any) => (
                <InvitationCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/library/squirrel-empty-square.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
              <p>招待コード記事はまだありません</p>
            </div>
          )}

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-black text-gray-900 text-lg mb-5">❓ 招待コードよくある質問</h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details key={i} className="border border-gray-100 rounded-xl overflow-hidden group">
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer font-bold text-sm text-gray-900 hover:bg-gray-50 select-none">
                    <span>Q. {item.q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2">▼</span>
                  </summary>
                  <div className="px-4 py-3 text-sm text-gray-600 leading-relaxed bg-gray-50 border-t border-gray-100">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* 注意書き */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
            <p className="font-bold mb-1">ご利用にあたって</p>
            <p>掲載している招待コードは取材・登録時点の情報です。キャンペーン終了・コード変更により予告なく変更される場合があります。最新情報は各サービスの公式サイトをご確認ください。招待コードの利用によるトラブルについて当サイトは責任を負いかねます。</p>
          </div>
        </div>
      </div>
    </>
  );
}
