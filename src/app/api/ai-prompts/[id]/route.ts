import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();
  const { title, content } = body;
  if (!title?.trim() || !content?.trim()) return errorResponse(ErrorCode.VALIDATION_ERROR, "title と content は必須です", 400);

  const { data, error } = await supabase
    .from("ai_prompts")
    .update({ title: title.trim(), content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

// デフォルトプロンプトの設定・解除（同時にデフォルトになれるのは1件のみ）
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();
  const { is_default } = body;
  if (typeof is_default !== "boolean") return errorResponse(ErrorCode.VALIDATION_ERROR, "is_default は必須です", 400);

  if (is_default) {
    await supabase.from("ai_prompts").update({ is_default: false }).eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("ai_prompts")
    .update({ is_default, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("ai_prompts").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
