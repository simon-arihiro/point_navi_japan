import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import type { ImageInput } from "@/lib/ai/types";
import {
  buildIntroductionArticlePrompt,
  buildInvitationArticlePrompt,
  buildRelatedArticlePrompt,
  splitContentAndDescription,
  SYSTEM_PROMPT_BASE,
  ExtraContext,
} from "@/lib/ai/prompts";
import { extractUrls, fetchWebContents } from "@/lib/ai/webContent";
import { buildThumbnailPrompt, generateThumbnailImage, placeImageAtTop } from "@/lib/ai/thumbnail";
import { GeminiQuotaExceededError } from "@/lib/ai/gemini";
import { uploadArticleImage } from "@/lib/storage";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest, after } from "next/server";
import { ArticleType } from "@/types/database";

const ARTICLE_CYCLE: ArticleType[] = ["guide", "faq", "comparison", "campaign", "earnings"];

// 記事本文・概要・サムネイル生成で複数回のAI呼び出し・画像処理を行うため、デフォルトの実行時間上限では不足することがある
export const maxDuration = 60;

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

    // デフォルトに設定されたAIプロンプト（あれば）を常に最優先指示の先頭に適用する
    const { data: defaultPrompt } = await supabase.from("ai_prompts").select("content").eq("is_default", true).maybeSingle();
    const userPrompt = [defaultPrompt?.content?.trim(), extra_prompt?.trim()].filter(Boolean).join("\n\n");

    const extraContext: ExtraContext = { userPrompt, webContents, imageUrls };

    let title: string;
    let content: string;
    let articleId: string;

    if (type === "introduction") {
      title = `${service.name}を実際に使ってみた感想｜メリット・デメリット・始め方まとめ`;
      const generated = splitContentAndDescription(
        await generateTaskText("article", SYSTEM_PROMPT_BASE, buildIntroductionArticlePrompt(service, extraContext), visionImages)
      );
      content = generated.content.replace(/^#\s+.+\n+/, "").trim(); // AIが誤ってh1タイトルを出力した場合の保険
      const description = generated.description;

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
    } else if (type === "invitation") {
      const generated = splitContentAndDescription(
        await generateTaskText("article", SYSTEM_PROMPT_BASE, buildInvitationArticlePrompt(service, extraContext), visionImages)
      );
      content = generated.content;
      const description = generated.description;

      const titleMatch = content.match(/^#\s+(.+)/m);
      title = titleMatch ? titleMatch[1].trim() : `${service.name}の招待コード・紹介特典まとめ`;
      content = content.replace(/^#\s+.+\n+/, "").trim();

      // 既存の invitation 記事があれば上書き（1サービスにつき1記事）
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("primary_service_id", service_id)
        .eq("article_type", "invitation")
        .is("deleted_at", null)
        .single();

      if (existing) {
        await supabase.from("articles").update({
          title, content, description: description.trim(),
          status: "reviewing", published_at: null,
        }).eq("id", existing.id);
        articleId = existing.id;
      } else {
        const slug = `${service.slug ?? service_id}-invitation`;
        const { data: inserted } = await supabase.from("articles").insert({
          primary_service_id: service_id,
          title, slug, content,
          description: description.trim(),
          article_type: "invitation",
          status: "reviewing",
          published_at: null,
        }).select("id").single();
        articleId = inserted!.id;
      }
    } else {
      const generated = splitContentAndDescription(
        await generateTaskText("article", SYSTEM_PROMPT_BASE, buildRelatedArticlePrompt(service, type as any, extraContext), visionImages)
      );
      content = generated.content;
      const description = generated.description;

      const titleMatch = content.match(/^#\s+(.+)/m);
      title = titleMatch ? titleMatch[1].trim() : `${service.name}の${type}`;

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

    // アイキャッチ画像生成はGemini呼び出しのレート制限待ちもあり時間がかかるため、
    // レスポンスを先に返したうえでafter()内で実行する（失敗してもクライアントの記事生成自体は成功扱いのまま）
    after(async () => {
      try {
        const thumbnailPrompt = buildThumbnailPrompt(service.name, type, title);
        const thumbnailUrl = await generateThumbnailImage(thumbnailPrompt, service_id);
        if (thumbnailUrl) {
          const updatedContent = placeImageAtTop(content, title, thumbnailUrl);
          await supabase.from("articles").update({ featured_image_url: thumbnailUrl, content: updatedContent }).eq("id", articleId);
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
