import { generateText } from "@/lib/ai/claude";
import { buildServiceInfoPrompt } from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { official_url } = await request.json();
  if (!official_url) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "official_url は必須です");
  }

  try {
    const infoJson = await generateText(
      "あなたはウェブサイトの情報を分析するAIアシスタントです。JSONのみ返してください。",
      buildServiceInfoPrompt(official_url)
    );

    let aiInfo: { name?: string; slug?: string; description?: string; categories?: string[]; tags?: string[] };
    try {
      aiInfo = JSON.parse(infoJson.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      return errorResponse(ErrorCode.AI_GENERATION_FAILED, "AIの応答を解析できませんでした", 500);
    }

    return Response.json({ data: aiInfo });
  } catch (err) {
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, String(err), 500);
  }
}
