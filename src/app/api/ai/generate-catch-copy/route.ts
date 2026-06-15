import { createAdminClient } from "@/lib/supabase/server";
import { generateTaskText } from "@/lib/ai/router";
import { buildCatchCopyPrompt, SYSTEM_PROMPT_BASE } from "@/lib/ai/prompts";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// 既存サービスの招待コードカード用キャッチコピーのみを生成・保存する（記事本文は変更しない一括バックフィル用）
export async function POST(request: NextRequest) {
  const { service_id } = await request.json();
  if (!service_id) return errorResponse(ErrorCode.VALIDATION_ERROR, "service_id は必須です");

  const supabase = createAdminClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", service_id).single();
  if (!service) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

  try {
    const raw = await generateTaskText("article", SYSTEM_PROMPT_BASE, buildCatchCopyPrompt(service));
    const catchCopy = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join("\n");
    if (!catchCopy) return errorResponse(ErrorCode.AI_GENERATION_FAILED, "キャッチコピーの生成結果が空でした", 500);

    await supabase.from("services").update({ catch_copy: catchCopy }).eq("id", service_id);
    return Response.json({ ok: true, catch_copy: catchCopy });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(ErrorCode.AI_GENERATION_FAILED, `キャッチコピー生成に失敗しました: ${message}`, 500);
  }
}
