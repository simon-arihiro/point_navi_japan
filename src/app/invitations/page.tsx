import { createClient } from "@/lib/supabase/server";
import InvitationCard from "@/components/InvitationCard";
import InvitationCodeTable from "@/components/InvitationCodeTable";
import SearchBox from "@/components/SearchBox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "招待コード一覧",
  description: "ポイ活サービスの招待コード・招待リンクと特典をまとめてご紹介します。",
};

export default async function InvitationsPage() {
  const supabase = await createClient();

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

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">🎁 招待コード一覧</h1>
          <p className="text-gray-500 text-sm mb-6">各サービスの招待コード・招待リンクと特典をまとめてご紹介します</p>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 sm:p-5 max-w-xl">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-black text-gray-900 text-base mb-3">📋 招待コード一覧表</h2>
        <InvitationCodeTable rows={codeRows} />

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a: any) => (
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
      </div>
    </div>
  );
}
