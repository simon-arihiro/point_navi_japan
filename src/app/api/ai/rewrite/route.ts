import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import { buildRewritePrompt, SYSTEM_PROMPT_BASE } from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { article_id, feedback } = await request.json();
  if (!article_id || !feedback) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "article_id と feedback は必須です");
  }

  const supabase = createAdminClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", article_id).single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  try {
    const newContent = await generateTaskText("article", SYSTEM_PROMPT_BASE, buildRewritePrompt(article.content, feedback));
    const titleMatch = newContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : article.title;

    await supabase.from("articles").update({
      content: newContent,
      title,
      status: "reviewing",
    }).eq("id", article_id);

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AI書き直しに失敗しました", 500);
  }
}
