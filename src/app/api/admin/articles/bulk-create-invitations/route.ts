import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// 招待コード記事がないサービスの一覧を返す
export async function GET() {
  const supabase = createAdminClient();

  const { data: services } = await supabase
    .from("services")
    .select(`
      id, name, slug, referral_code,
      articles:articles!articles_primary_service_id_fkey(id, article_type, status)
    `)
    .order("name");

  const missing = (services ?? []).filter((s: any) => {
    const invArticle = s.articles?.find((a: any) => a.article_type === "invitation");
    return !invArticle;
  }).map((s: any) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    referral_code: s.referral_code,
  }));

  return Response.json({ missing, total: services?.length ?? 0 });
}

// 指定サービスIDリストに対して招待コード記事を一括生成（generate-article APIを順番に呼ぶ）
export async function POST(request: NextRequest) {
  const { service_ids } = await request.json();
  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    return Response.json({ error: "service_ids is required" }, { status: 400 });
  }

  const results: { service_id: string; ok: boolean; error?: string }[] = [];

  const origin = new URL(request.url).origin;

  for (const service_id of service_ids) {
    try {
      const res = await fetch(`${origin}/api/ai/generate-article`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id, article_type: "invitation" }),
      });
      const json = await res.json();
      results.push({ service_id, ok: json.ok ?? false, error: json.error });
    } catch (err) {
      results.push({ service_id, ok: false, error: String(err) });
    }
  }

  return Response.json({ results });
}
