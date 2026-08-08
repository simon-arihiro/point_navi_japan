import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  // サービス別投稿数
  const { data: submissions } = await supabase
    .from("code_submissions")
    .select("service_id");

  // 投稿数をカウント
  const countMap: Record<string, number> = {};
  for (const s of submissions ?? []) {
    countMap[s.service_id] = (countMap[s.service_id] ?? 0) + 1;
  }

  // サービス一覧
  const { data: services } = await supabase
    .from("services")
    .select("id, name, slug, logo_url, logo_storage_path")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  const servicesWithCount = (services ?? []).map((s) => ({
    ...s,
    submission_count: countMap[s.id] ?? 0,
  }));

  // 最近の投稿10件（全サービス横断）
  const { data: recent } = await supabase
    .from("code_submissions")
    .select("id, service_id, nickname, referral_code, created_at, service:services!code_submissions_service_id_fkey(name, slug)")
    .order("created_at", { ascending: false })
    .limit(10);

  // ランキング（投稿数順 top5）
  const ranking = [...servicesWithCount]
    .filter((s) => s.submission_count > 0)
    .sort((a, b) => b.submission_count - a.submission_count)
    .slice(0, 5);

  return Response.json({ services: servicesWithCount, recent: recent ?? [], ranking });
}
