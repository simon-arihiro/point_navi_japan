import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import { extractJson } from "@/lib/ai/json";
import { buildServiceInfoPrompt } from "@/lib/ai/prompts";
import { fetchWebContents } from "@/lib/ai/webContent";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { official_url } = await request.json();
  if (!official_url) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "official_url は必須です");
  }

  try {
    const supabase = createAdminClient();
    const [{ data: categories }, webContents] = await Promise.all([
      supabase.from("categories").select("name").order("name"),
      fetchWebContents([official_url]),
    ]);
    const existingCategories = (categories ?? []).map((c) => c.name);
    const pageContent = webContents[0]?.content ?? null;

    const infoJson = await generateTaskText(
      "autofill",
      "あなたはウェブサイトの情報を分析するAIアシスタントです。JSONのみ返してください。",
      buildServiceInfoPrompt(official_url, existingCategories, pageContent)
    );

    const aiInfo = extractJson<{
      name?: string;
      slug?: string;
      description?: string;
      categories?: string[];
      tags?: string[];
      bonus_points?: number | null;
      bonus_amount?: string | null;
      campaign_bonus?: string | null;
      campaign_expires_at?: string | null;
      logo_url?: string | null;
    }>(infoJson);
    if (!aiInfo) {
      return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AIの応答を解析できませんでした", 500);
    }

    return Response.json({ data: aiInfo });
  } catch (err) {
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, String(err), 500);
  }
}
