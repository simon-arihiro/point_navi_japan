import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";

// AI臭さ抹除の一括見直し対象（公開中・公開待ち・審査待ちの記事）一覧を返す
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, status")
    .in("status", ["published", "queued", "reviewing"])
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);
  return Response.json({ data: data ?? [] });
}
