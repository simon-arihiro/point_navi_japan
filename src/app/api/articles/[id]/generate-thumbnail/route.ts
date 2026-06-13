import { createAdminClient } from "@/lib/supabase/server";
import { buildThumbnailPrompt, generateAndSaveThumbnail } from "@/lib/ai/thumbnail";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// 記事のアイキャッチ画像をAI（Gemini）で再生成する
export async function POST(_req: NextRequest, props: RouteContext<"/api/articles/[id]/generate-thumbnail">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, article_type, primary_service_id")
    .eq("id", id)
    .single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  const { data: service } = await supabase
    .from("services")
    .select("name")
    .eq("id", article.primary_service_id)
    .single();

  try {
    const prompt = buildThumbnailPrompt(service?.name ?? "", article.article_type, article.title);
    const url = await generateAndSaveThumbnail(supabase, article.id, article.primary_service_id, prompt);
    if (!url) return errorResponse(ErrorCode.AI_GENERATION_FAILED, "サムネイル生成に失敗しました", 500);
    return Response.json({ url });
  } catch (err) {
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, `サムネイル生成に失敗しました: ${String(err)}`, 500);
  }
}
