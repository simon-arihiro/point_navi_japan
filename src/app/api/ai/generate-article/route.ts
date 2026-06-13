import { createAdminClient } from "@/lib/supabase/server";
import { generateText, ImageInput } from "@/lib/ai/claude";
import {
  buildIntroductionArticlePrompt,
  buildRelatedArticlePrompt,
  buildDescriptionPrompt,
  SYSTEM_PROMPT_BASE,
  ExtraContext,
} from "@/lib/ai/prompts";
import { extractUrls, fetchWebContents } from "@/lib/ai/webContent";
import { buildThumbnailPrompt, generateThumbnailImage } from "@/lib/ai/thumbnail";
import { GeminiQuotaExceededError } from "@/lib/ai/gemini";
import { uploadArticleImage } from "@/lib/storage";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";
import { ArticleType } from "@/types/database";

const ARTICLE_CYCLE: ArticleType[] = ["guide", "faq", "comparison", "campaign", "earnings"];

export async function POST(request: NextRequest) {
  const { service_id, article_type, extra_prompt, images } = await request.json();
  if (!service_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "service_id は必須です");

  const supabase = createAdminClient();

  const { data: service } = await supabase.from("services").select("*").eq("id", service_id).single();
  if (!service) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

  // 記事タイプが未指定の場合、関連記事の中からローテーション選択
  let type: ArticleType = article_type;
  if (!type) {
    const { data: existing } = await supabase
      .from("articles")
      .select("article_type")
      .eq("primary_service_id", service_id)
      .is("deleted_at", null)
      .neq("article_type", "introduction");

    const usedTypes = (existing ?? []).map((a: any) => a.article_type);
    const unused = ARTICLE_CYCLE.filter((t) => !usedTypes.includes(t));
    type = unused.length > 0 ? unused[0] : ARTICLE_CYCLE[usedTypes.length % ARTICLE_CYCLE.length];
  }

  try {
    // 添付画像をStorageにアップロード（AI Vision用の入力 + 本文挿入用URLの両方に使う）
    const visionImages: ImageInput[] = [];
    const imageUrls: string[] = [];
    for (const img of images ?? []) {
      visionImages.push({ mediaType: img.media_type, data: img.data });
      const url = await uploadArticleImage(service_id, img.data, img.media_type);
      if (url) imageUrls.push(url);
    }

    // プロンプト内のURLからページ本文を取得
    const urls = extractUrls(extra_prompt ?? "");
    const webContents = await fetchWebContents(urls);

    const extraContext: ExtraContext = { userPrompt: extra_prompt, webContents, imageUrls };

    let title: string;
    let content: string;
    let articleId: string;

    if (type === "introduction") {
      title = `${service.name}を実際に使ってみた感想｜メリット・デメリット・始め方まとめ`;
      content = (await generateText(SYSTEM_PROMPT_BASE, buildIntroductionArticlePrompt(service, extraContext), visionImages))
        .replace(/^#\s+.+\n+/, "") // AIが誤ってh1タイトルを出力した場合の保険
        .trim();

      const description = await generateText(
        "SEO meta descriptionを150字以内で生成するアシスタントです。",
        buildDescriptionPrompt(title, content)
      );

      // 既存の introduction 記事があれば上書き
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("primary_service_id", service_id)
        .eq("article_type", "introduction")
        .is("deleted_at", null)
        .single();

      if (existing) {
        await supabase.from("articles").update({
          title, content, description: description.trim(),
          status: "reviewing", published_at: null,
        }).eq("id", existing.id);
        articleId = existing.id;
      } else {
        const slug = `${service.slug ?? service_id}-introduction`;
        const { data: inserted } = await supabase.from("articles").insert({
          primary_service_id: service_id,
          title, slug, content,
          description: description.trim(),
          article_type: "introduction",
          status: "reviewing",
          published_at: null,
        }).select("id").single();
        articleId = inserted!.id;
      }
    } else {
      content = await generateText(SYSTEM_PROMPT_BASE, buildRelatedArticlePrompt(service, type as any, extraContext), visionImages);

      const titleMatch = content.match(/^#\s+(.+)/m);
      title = titleMatch ? titleMatch[1].trim() : `${service.name}の${type}`;

      const description = await generateText(
        "SEO meta descriptionを150字以内で生成するアシスタントです。",
        buildDescriptionPrompt(title, content)
      );

      const slug = `${service.slug}-${type}-${Date.now()}`;
      const { data: inserted } = await supabase.from("articles").insert({
        primary_service_id: service_id,
        title, slug, content,
        description: description.trim(),
        article_type: type,
        status: "reviewing",
        published_at: null,
      }).select("id").single();
      articleId = inserted!.id;
    }

    // アイキャッチ画像をAI（Gemini）で生成。無料枠の上限等で失敗しても記事生成は成功させる
    try {
      const thumbnailPrompt = buildThumbnailPrompt(service.name, type, title);
      const thumbnailUrl = await generateThumbnailImage(thumbnailPrompt, service_id);
      if (thumbnailUrl) {
        await supabase.from("articles").update({ featured_image_url: thumbnailUrl }).eq("id", articleId);
      }
    } catch (thumbErr) {
      console.error("thumbnail generation failed:", thumbErr);
      await supabase.from("admin_notifications").insert({
        type: "image_failed",
        payload: {
          article_id: articleId,
          service_id,
          service_name: service.name,
          reason: thumbErr instanceof GeminiQuotaExceededError ? "quota_exceeded" : "error",
          detail: String(thumbErr),
        },
      });
    }

    await supabase.from("admin_notifications").insert({
      type: "article_pending",
      payload: { service_id, service_name: service.name, article_type: type },
    });

    return Response.json({ ok: true, article_id: articleId, article_type: type });
  } catch (err) {
    await supabase.from("admin_notifications").insert({
      type: "ai_failed",
      payload: { service_id, error: String(err) },
    });
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AI記事生成に失敗しました", 500);
  }
}
