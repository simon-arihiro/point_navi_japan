import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import { extractJson } from "@/lib/ai/json";
import { buildServiceInfoPrompt } from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { official_url } = await request.json();
  if (!official_url) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "official_url は必須です");
  }

  try {
    const supabase = createAdminClient();
    const { data: categories } = await supabase.from("categories").select("name").order("name");
    const existingCategories = (categories ?? []).map((c) => c.name);

    const infoJson = await generateTaskText(
      "autofill",
      "あなたはウェブサイトの情報を分析するAIアシスタントです。JSONのみ返してください。",
      buildServiceInfoPrompt(official_url, existingCategories)
    );

    const aiInfo = extractJson<{
      name?: string;
      slug?: string;
      description?: string;
      categories?: string[];
      tags?: string[];
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
