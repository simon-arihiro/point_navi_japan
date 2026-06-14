import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const category = request.nextUrl.searchParams.get("category");
  let query = supabase.from("ai_prompts").select("*").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { title, content, category } = body;
  if (!title?.trim() || !content?.trim()) return errorResponse(ErrorCode.VALIDATION_ERROR, "title と content は必須です", 400);

  const { data, error } = await supabase
    .from("ai_prompts")
    .insert({ title: title.trim(), content, category: category === "thumbnail" ? "thumbnail" : "article" })
    .select()
    .single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
