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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("ai_prompts").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
