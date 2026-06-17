import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";
import { DistributionPlatform } from "@/types/database";
import { distributeArticle } from "@/lib/sns/dispatch";
import { SNS_PLATFORMS } from "@/lib/sns/platforms";

const SUPPORTED_PLATFORMS: DistributionPlatform[] = SNS_PLATFORMS.map((p) => p.id);

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("article_id");
  if (!articleId) return errorResponse(ErrorCode.VALIDATION_ERROR, "article_id は必須です");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("distribution_logs")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const { article_id, platforms } = await request.json();
  if (!article_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "article_id は必須です");

  const supabase = createAdminClient();

  // 発行済み記事のみ許可
  const { data: article } = await supabase.from("articles").select("id, status").eq("id", article_id).single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
  if (article.status !== "published") {
    return errorResponse(ErrorCode.PERMISSION_DENIED, "published ステータスの記事のみ配信できます", 403);
  }

  const targets: DistributionPlatform[] = (platforms ?? SUPPORTED_PLATFORMS).filter((p: DistributionPlatform) =>
    SUPPORTED_PLATFORMS.includes(p)
  );

  const results = [];
  for (const platform of targets) {
    const result = await distributeArticle(article_id, platform);
    results.push({ platform, ...result });
  }

  return Response.json({ ok: results.every((r) => r.ok), results });
}
