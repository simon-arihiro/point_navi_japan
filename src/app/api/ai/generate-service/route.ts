import { createAdminClient } from "@/lib/supabase/server";
import { generateText, extractJson } from "@/lib/ai/claude";
import {
  buildServiceInfoPrompt,
  buildIntroductionArticlePrompt,
  buildDescriptionPrompt,
  SYSTEM_PROMPT_BASE,
} from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { service_id } = await request.json();
  if (!service_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "service_id は必須です");

  const supabase = createAdminClient();

  // 取得 service
  const { data: service, error: svcErr } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if (svcErr || !service) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

  try {
    const { data: existingCategories } = await supabase.from("categories").select("id, name");

    // AI でサービス情報補完（slug / description / categories / tags）
    const infoJson = await generateText(
      "あなたはウェブサイトの情報を分析するAIアシスタントです。JSONのみ返してください。",
      buildServiceInfoPrompt(service.official_url, (existingCategories ?? []).map((c) => c.name))
    );

    const aiInfo = extractJson<{ name?: string; slug?: string; description?: string; categories?: string[]; tags?: string[] }>(infoJson) ?? {};

    // slug / description を更新
    const updates: Record<string, string> = {};
    if (aiInfo.slug && !service.slug) updates.slug = aiInfo.slug;
    if (aiInfo.description) updates.description = aiInfo.description;

    if (Object.keys(updates).length > 0) {
      await supabase.from("services").update(updates).eq("id", service_id);
    }

    // カテゴリは既存のものから一致するものだけを紐付ける（新規作成はしない）
    if (aiInfo.categories?.length) {
      for (const catName of aiInfo.categories) {
        const cat = (existingCategories ?? []).find((c) => c.name.toLowerCase() === catName.toLowerCase());
        if (cat) {
          await supabase.from("service_categories").upsert(
            { service_id, category_id: cat.id },
            { onConflict: "service_id,category_id" }
          );
        }
      }
    }

    if (aiInfo.tags?.length) {
      for (const tagName of aiInfo.tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, "-");
        const { data: tag } = await supabase
          .from("tags")
          .upsert({ name: tagName, slug }, { onConflict: "slug" })
          .select()
          .single();
        if (tag) {
          await supabase.from("service_tags").upsert(
            { service_id, tag_id: tag.id },
            { onConflict: "service_id,tag_id" }
          );
        }
      }
    }

    // Service介绍 記事を生成
    const updatedService = { ...service, ...updates };
    const articleContent = await generateText(SYSTEM_PROMPT_BASE, buildIntroductionArticlePrompt(updatedService));

    const titleMatch = articleContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : `${service.name}の紹介`;
    const contentWithoutTitle = articleContent.replace(/^#\s+.+\n?/, "").trim();

    const description = await generateText(
      "SEO meta descriptionを150字以内で生成するアシスタントです。",
      buildDescriptionPrompt(title, contentWithoutTitle)
    );

    const articleSlug = `${updatedService.slug ?? service_id}-introduction`;

    // 既存の introduction 記事があれば上書き
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("primary_service_id", service_id)
      .eq("article_type", "introduction")
      .single();

    // operation_mode の確認
    const { data: settings } = await supabase.from("system_settings").select("operation_mode").eq("id", 1).single();
    const status = settings?.operation_mode === "auto" ? "published" : "draft";

    if (existing) {
      await supabase.from("articles").update({
        title, content: articleContent, description: description.trim(),
        status, published_at: status === "published" ? new Date().toISOString() : null,
      }).eq("id", existing.id);
    } else {
      await supabase.from("articles").insert({
        primary_service_id: service_id,
        title, slug: articleSlug,
        content: articleContent,
        description: description.trim(),
        article_type: "introduction",
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
    }

    // 通知（manual の場合）
    if (status === "draft") {
      await supabase.from("admin_notifications").insert({
        type: "article_pending",
        payload: { service_id, service_name: service.name, article_slug: articleSlug },
      });
    }

    return Response.json({ ok: true, status });
  } catch (err) {
    await supabase.from("admin_notifications").insert({
      type: "ai_failed",
      payload: { service_id, error: String(err) },
    });
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AI生成に失敗しました", 500);
  }
}
