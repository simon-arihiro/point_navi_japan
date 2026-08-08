import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import CodeBoard from "./CodeBoard";

export const metadata: Metadata = {
  title: "招待コード掲示板",
  description: "みんなが投稿した招待コードを検索・コピーできる掲示板です。ポイ活サービスの招待コードをシェアしよう！",
};

export default async function CodesPage() {
  const supabase = await createClient();

  // 投稿可能なサービス一覧（activeかつ招待コードがあるもの）
  const { data: services } = await supabase
    .from("services")
    .select("id, name, logo_url, logo_storage_path, slug")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  return <CodeBoard services={services ?? []} />;
}
