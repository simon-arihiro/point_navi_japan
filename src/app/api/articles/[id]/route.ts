import { createAdminClient } from "@/lib/supabase/server";
import { getArticleViewCount } from "@/lib/analytics";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`*, primary_service:services!articles_primary_service_id_fkey(*), related_services:article_services(service:services(*))`)
    .eq("id", id)
    .single();

  if (error || !data) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  const viewCount = await getArticleViewCount(supabase, id);
  return Response.json({ data: { ...data, view_count: viewCount } });
}

export async function PUT(request: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();
  const body = await request.json();

  // 比較記事などで関連付ける他サービス（article_services中間テーブル）の更新
  const { related_service_ids, ...articleFields } = body;
  if (Array.isArray(related_service_ids)) {
    await supabase.from("article_services").delete().eq("article_id", id);
    if (related_service_ids.length > 0) {
      const { error: relError } = await supabase
        .from("article_services")
        .insert(related_service_ids.map((service_id: string) => ({ article_id: id, service_id })));
      if (relError) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, relError.message, 500);
    }
  }

  if (articleFields.status === "published" && !articleFields.published_at) {
    articleFields.published_at = new Date().toISOString();
  }

  if (Object.keys(articleFields).length === 0) {
    const { data, error } = await supabase
      .from("articles")
      .select(`*, primary_service:services!articles_primary_service_id_fkey(*), related_services:article_services(service:services(*))`)
      .eq("id", id)
      .single();
    if (error || !data) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
    return Response.json({ data });
  }

  const { data, error } = await supabase
    .from("articles")
    .update(articleFields)
    .eq("id", id)
    .select(`*, primary_service:services!articles_primary_service_id_fkey(*), related_services:article_services(service:services(*))`)
    .single();

  if (error || !data) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);
  return Response.json({ data });
}

export async function DELETE(_req: NextRequest, props: RouteContext<"/api/articles/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  // ゴミ箱へ移動（論理削除）
  const { error } = await supabase.from("articles").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
