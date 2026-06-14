import { createAdminClient } from "@/lib/supabase/server";
import { buildThumbnailPrompt, generateThumbnailImage, placeImageAtTop } from "@/lib/ai/thumbnail";
import { GeminiQuotaExceededError } from "@/lib/ai/gemini";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// 記事のアイキャッチ画像をAI（Gemini）で再生成し、本文の最前面に新しい画像を配置する
export async function POST(request: NextRequest, props: RouteContext<"/api/articles/[id]/generate-thumbnail">) {
  const { id } = await props.params;
  const { feedback } = await request.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content, article_type, primary_service_id")
    .eq("id", id)
    .single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  const { data: service } = await supabase
    .from("services")
    .select("name")
    .eq("id", article.primary_service_id)
    .single();

  try {
    let prompt = buildThumbnailPrompt(service?.name ?? "", article.article_type, article.title);
    if (feedback?.trim()) {
      prompt += `\n\n【追加の指示】\n${feedback.trim()}`;
    }

    const url = await generateThumbnailImage(prompt, article.primary_service_id);
    if (!url) return errorResponse(ErrorCode.AI_GENERATION_FAILED, "サムネイル生成に失敗しました", 500);

    const updatedContent = placeImageAtTop(article.content, article.title, url);

    await supabase
      .from("articles")
      .update({ featured_image_url: url, content: updatedContent })
      .eq("id", id);

    return Response.json({ url, content: updatedContent });
  } catch (err) {
    if (err instanceof GeminiQuotaExceededError) {
      return errorResponse(ErrorCode.AI_GENERATION_FAILED, `${err.message}。日本時間の午前中頃にリセットされます`, 429);
    }
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, `サムネイル生成に失敗しました: ${String(err)}`, 500);
  }
}
