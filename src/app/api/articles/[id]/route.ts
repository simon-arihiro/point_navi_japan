import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`*, primary_service:services(*), related_services:article_services(service:services(*))`)
    .eq("id", id)
    .single();

  if (error || !data) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
  return Response.json({ data });
}

export async function PUT(request: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();
  const body = await request.json();

  if (body.status === "published" && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("articles")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
  return Response.json({ data });
}

export async function DELETE(_req: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = await createAdminClient();

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
