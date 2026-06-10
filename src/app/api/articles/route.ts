import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const service_id = searchParams.get("service_id");
  const article_type = searchParams.get("article_type");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  let query = supabase
    .from("articles")
    .select(`*, primary_service:services!articles_primary_service_id_fkey(*)`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (service_id) query = query.eq("primary_service_id", service_id);
  if (article_type) query = query.eq("article_type", article_type);

  const { data, error } = await query;
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { primary_service_id, title, slug, description, content, article_type, status } = body;
  if (!primary_service_id || !title || !slug || !article_type) {
    return errorResponse(ErrorCode.VALIDATION_ERROR, "primary_service_id, title, slug, article_type は必須です");
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      primary_service_id, title, slug,
      description: description ?? "",
      content: content ?? "",
      article_type,
      status: status ?? "draft",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data }, { status: 201 });
}
