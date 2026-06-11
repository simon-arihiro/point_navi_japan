import { createAdminClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/claude";
import {
  buildRelatedArticlePrompt,
  buildDescriptionPrompt,
  SYSTEM_PROMPT_BASE,
} from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";
import { ArticleType } from "@/types/database";

const ARTICLE_CYCLE: ArticleType[] = ["guide", "faq", "comparison", "campaign", "earnings"];

export async function POST(request: NextRequest) {
  const { service_id, article_type } = await request.json();
  if (!service_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "service_id は必須です");

  const supabase = createAdminClient();

  const { data: service } = await supabase.from("services").select("*").eq("id", service_id).single();
  if (!service) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

  // 記事タイプが未指定の場合、ローテーション選択
  let type: ArticleType = article_type;
  if (!type) {
    const { data: existing } = await supabase
      .from("articles")
      .select("article_type")
      .eq("primary_service_id", service_id)
      .neq("article_type", "introduction");

    const usedTypes = (existing ?? []).map((a: any) => a.article_type);
    const unused = ARTICLE_CYCLE.filter((t) => !usedTypes.includes(t));
    type = unused.length > 0 ? unused[0] : ARTICLE_CYCLE[usedTypes.length % ARTICLE_CYCLE.length];
  }

  try {
    const content = await generateText(SYSTEM_PROMPT_BASE, buildRelatedArticlePrompt(service, type as any));

    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : `${service.name}の${type}`;

    const description = await generateText(
      "SEO meta descriptionを150字以内で生成するアシスタントです。",
      buildDescriptionPrompt(title, content)
    );

    const timestamp = Date.now();
    const slug = `${service.slug}-${type}-${timestamp}`;
    const status = "reviewing";

    await supabase.from("articles").insert({
      primary_service_id: service_id,
      title, slug, content,
      description: description.trim(),
      article_type: type,
      status,
      published_at: null,
    });

    await supabase.from("admin_notifications").insert({
      type: "article_pending",
      payload: { service_id, service_name: service.name, article_type: type },
    });

    return Response.json({ ok: true, status, article_type: type });
  } catch (err) {
    await supabase.from("admin_notifications").insert({
      type: "ai_failed",
      payload: { service_id, error: String(err) },
    });
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AI記事生成に失敗しました", 500);
  }
}
