import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// 既読/未読の切り替え（Admin）
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { is_read } = body;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ is_read: !!is_read })
    .eq("id", id)
    .select()
    .single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}
