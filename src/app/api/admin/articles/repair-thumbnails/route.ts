import { createAdminClient } from "@/lib/supabase/server";
import { placeImageAtTop } from "@/lib/markdown";
import { errorResponse, ErrorCode } from "@/lib/errors";

// AI一括文体修正等で先頭サムネイル画像が本文から消えてしまった記事を、featured_image_urlを使って復元する
// placeImageAtTopは既存の先頭画像があれば置き換え、なければ先頭に追加するため、本文中の画像は常に1枚のみになる
export async function POST() {
  const supabase = createAdminClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, content, featured_image_url")
    .not("featured_image_url", "is", null)
    .is("deleted_at", null);

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  let fixed = 0;
  for (const a of articles ?? []) {
    if (!a.content || !a.featured_image_url || a.content.includes(a.featured_image_url)) continue;
    const newContent = placeImageAtTop(a.content, a.title, a.featured_image_url);
    const { error: updateError } = await supabase.from("articles").update({ content: newContent }).eq("id", a.id);
    if (!updateError) fixed += 1;
  }

  return Response.json({ fixed, total: articles?.length ?? 0 });
}
