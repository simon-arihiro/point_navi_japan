import { createAdminClient } from "@/lib/supabase/server";
import { uploadArticleImage } from "@/lib/storage";
import { errorResponse, ErrorCode } from "@/lib/errors";
import { NextRequest } from "next/server";

// 記事の手動編集中にペーストされた画像をStorageにアップロードし、本文に挿入するURLを返す
export async function POST(request: NextRequest, props: RouteContext<"/api/articles/[id]/upload-image">) {
  const { id } = await props.params;
  const { data, media_type } = await request.json();
  if (!data || !media_type) return errorResponse(ErrorCode.VALIDATION_ERROR, "data, media_type は必須です");

  const supabase = createAdminClient();
  const { data: article } = await supabase.from("articles").select("primary_service_id").eq("id", id).single();
  if (!article) return errorResponse(ErrorCode.ARTICLE_NOT_FOUND, "記事が見つかりません", 404);

  const url = await uploadArticleImage(article.primary_service_id, data, media_type);
  if (!url) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "画像のアップロードに失敗しました", 500);

  return Response.json({ url });
}
