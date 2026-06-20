import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import { buildRewritePrompt, SYSTEM_PROMPT_BASE } from "@/lib/ai/prompts";
import { uploadArticleImage } from "@/lib/storage";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { article_id, feedback, images, keep_status } = await request.json();
  if (!article_id || !feedback) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "article_id と feedback は必須です");
  }

  const supabase = createAdminClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", article_id).single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  try {
    const { data: defaultPrompt } = await supabase.from("ai_prompts").select("content").eq("category", "article").eq("is_default", true).maybeSingle();
    const hasImages = Array.isArray(images) && images.length > 0;

    // 添付画像はStorageにアップロードし、本文に挿入したい場合はAIにURLを伝えて`![説明](URL)`形式で配置してもらう
    const imageUrls: string[] = hasImages
      ? (await Promise.all(
          images.map((img: { data: string; mediaType: string }) => uploadArticleImage(article.primary_service_id, img.data, img.mediaType))
        )).filter((url): url is string => !!url)
      : [];

    const newContent = await generateTaskText(
      "article",
      SYSTEM_PROMPT_BASE,
      buildRewritePrompt(article.content, feedback, defaultPrompt?.content, imageUrls),
      hasImages ? images : undefined
    );
    const titleMatch = newContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : article.title;

    await supabase.from("articles").update({
      content: newContent,
      title,
      ...(keep_status ? {} : { status: "reviewing" }),
    }).eq("id", article_id);

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, `AI書き直しに失敗しました: ${message}`, 500);
  }
}
