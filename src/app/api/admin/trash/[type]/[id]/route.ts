import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

const TABLES: Record<string, "services" | "articles" | "categories"> = {
  services: "services",
  articles: "articles",
  categories: "categories",
};

// ゴミ箱から復元（論理削除を取り消す）
export async function POST(_req: NextRequest, props: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await props.params;
  const table = TABLES[type];
  if (!table) return errorResponse(ErrorCode.VALIDATION_ERROR, "不正な種別です", 400);

  const supabase = createAdminClient();

  if (table === "services") {
    // サービスを復元する際、同じタイミングでゴミ箱へ移動した関連記事もカスケード復元する
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("deleted_at")
      .eq("id", id)
      .single();
    if (fetchError || !service) return errorResponse(ErrorCode.SERVICE_NOT_FOUND, "サービスが見つかりません", 404);

    const { error } = await supabase.from("services").update({ deleted_at: null }).eq("id", id);
    if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

    if (service.deleted_at) {
      await supabase
        .from("articles")
        .update({ deleted_at: null })
        .eq("primary_service_id", id)
        .eq("deleted_at", service.deleted_at);
    }
  } else {
    const { error } = await supabase.from(table).update({ deleted_at: null }).eq("id", id);
    if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  }

  return new Response(null, { status: 204 });
}

// ゴミ箱から完全削除（元に戻せない）。関連レコードは外部キーの ON DELETE CASCADE で連動削除される
export async function DELETE(_req: NextRequest, props: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await props.params;
  const table = TABLES[type];
  if (!table) return errorResponse(ErrorCode.VALIDATION_ERROR, "不正な種別です", 400);

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return new Response(null, { status: 204 });
}
