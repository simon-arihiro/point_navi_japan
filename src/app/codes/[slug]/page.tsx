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

  if (!service) return { title: "招待コード掲示板" };

  return {
    title: `${service.name} 招待コード掲示板`,
    description: `${service.name}の招待コードを投稿・検索できる掲示板です。ポイント獲得やフレンド募集にご活用ください。`,
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

  return <CodeBoard service={service} />;
}
