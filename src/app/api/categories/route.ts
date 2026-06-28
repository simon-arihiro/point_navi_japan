import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { toSlug } from "@/lib/slug";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("categories").select("*, service_categories(count)").is("deleted_at", null).order("name");
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { name, slug: slugInput } = body;
  if (!name) return errorResponse(ErrorCode.VALIDATION_ERROR, "name is required", 400);

  // カテゴリ名が日本語のみだと自動生成slugが空文字になり cat-<timestamp> 形式の読めないURLになるため、
  // 管理画面から手動で指定されたslugを優先する
  const slug = slugInput?.trim() || toSlug(name, "cat");
  const { data, error } = await supabase.from("categories").insert({ name, slug }).select().single();
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
