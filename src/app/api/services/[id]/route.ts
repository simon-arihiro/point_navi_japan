import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode, isSlugConflict, SLUG_CONFLICT_MESSAGE } from "@/lib/errors";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("services")
    .select(`*, categories:service_categories(category:categories(*)), tags:service_tags(tag:tags(*)), images:service_images(*)`)
    .eq("id", id)
    .single();

  if (error || !data) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);
  return Response.json({ data });
}

export async function PUT(request: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();
  const body = await request.json();

  // category_ids 等は services テーブルの列ではないため update 対象から除外する
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { category_ids, categories, tags, images, id: _id, created_at, updated_at, ...updates } = body;

  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (isSlugConflict(error)) return errorResponse(ErrorCode.VALIDATION_ERROR, SLUG_CONFLICT_MESSAGE);
    return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  }
  if (!data) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

  if (Array.isArray(category_ids)) {
    await supabase.from("service_categories").delete().eq("service_id", id);
    if (category_ids.length > 0) {
      const { error: catError } = await supabase
        .from("service_categories")
        .insert(category_ids.map((category_id: string) => ({ service_id: id, category_id })));
      if (catError) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, catError.message, 500);
    }
  }

  return Response.json({ data });
}

export async function DELETE(_req: NextRequest, props: RouteContext<"/api/services/[id]">) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  // ゴミ箱へ移動（論理削除）。関連記事も同じタイムスタンプで一緒にゴミ箱へ移動し、カスケード復元できるようにする
  const deletedAt = new Date().toISOString();
  const { error } = await supabase.from("services").update({ deleted_at: deletedAt }).eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  await supabase.from("articles").update({ deleted_at: deletedAt }).eq("primary_service_id", id);

  return new Response(null, { status: 204 });
}
