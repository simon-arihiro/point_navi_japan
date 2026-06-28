import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";

export async function GET() {
  const supabase = createAdminClient();

  const [
    { data: services, error: servicesError },
    { data: articles, error: articlesError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, slug, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("articles")
      .select("id, title, article_type, deleted_at, primary_service_id")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const error = servicesError || articlesError || categoriesError;
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  return Response.json({
    data: {
      services: services ?? [],
      articles: articles ?? [],
      categories: categories ?? [],
    },
  });
}

// ゴミ箱を空にする（全アイテムを完全削除）。関連レコードは外部キーの ON DELETE CASCADE で連動削除される
export async function DELETE() {
  const supabase = createAdminClient();

  const [{ error: servicesError }, { error: articlesError }, { error: categoriesError }] = await Promise.all([
    supabase.from("services").delete().not("deleted_at", "is", null),
    supabase.from("articles").delete().not("deleted_at", "is", null),
    supabase.from("categories").delete().not("deleted_at", "is", null),
  ]);

  const error = servicesError || articlesError || categoriesError;
  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  return new Response(null, { status: 204 });
}
