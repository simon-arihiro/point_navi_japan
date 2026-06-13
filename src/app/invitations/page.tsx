import { createClient } from "@/lib/supabase/server";
import InvitationCard from "@/components/InvitationCard";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "招待コード一覧",
  description: "ポイ活サービスの招待コード・招待リンクと特典をまとめてご紹介します。",
};

export default async function InvitationsPage() {
  const supabase = await createClient();

  const [{ data }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("articles")
      .select(`*, primary_service:services!articles_primary_service_id_fkey(*, categories:service_categories(category:categories(*)))`)
      .eq("article_type", "invitation")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const articles = data ?? [];
  const categories = categoriesData ?? [];

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">🎁 招待コード一覧</h1>
          <p className="text-gray-500 text-sm">各サービスの招待コード・招待リンクと特典をまとめてご紹介します</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
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

          <aside>
            <Sidebar categories={categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}
