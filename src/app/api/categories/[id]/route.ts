import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const body = await request.json();
  const { name, slug } = body;

  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id)
    .select()
    .single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
