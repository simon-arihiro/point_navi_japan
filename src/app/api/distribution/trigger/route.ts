import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";
import { DistributionPlatform } from "@/types/database";

const SUPPORTED_PLATFORMS: DistributionPlatform[] = ["x", "instagram", "threads"];

export async function POST(request: NextRequest) {
  const { article_id, platforms } = await request.json();
  if (!article_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "article_id は必須です");

  const supabase = await createAdminClient();

  // 発行済み記事のみ許可
  const { data: article } = await supabase.from("articles").select("*").eq("id", article_id).single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
  if (article.status !== "published") {
    return errorResponse(ErrorCode.PERMISSION_DENIED, "published ステータスの記事のみ配信できます", 403);
  }

  const targets: DistributionPlatform[] = platforms ?? SUPPORTED_PLATFORMS;
  const logs = [];

  for (const platform of targets) {
    if (!SUPPORTED_PLATFORMS.includes(platform)) continue;
    // V2 実装: 各プラットフォームの API 連携はここで実装
    const { data: log } = await supabase.from("distribution_logs").insert({
      article_id,
      platform,
      status: "pending",
    }).select().single();
    logs.push(log);
  }

  return Response.json({ ok: true, logs });
}
