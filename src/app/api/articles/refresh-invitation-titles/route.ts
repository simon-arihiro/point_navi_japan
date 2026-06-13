import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";

// 招待コード記事タイトル先頭の「【YYYY年M月最新】」（旧形式の「【YYYY年M月】」も含む）を現在の年月に一括更新する
const TITLE_DATE_PREFIX = /^【\d{4}年\d{1,2}月(?:最新)?】/;

export async function POST() {
  const supabase = createAdminClient();
  const now = new Date();
  const newPrefix = `【${now.getFullYear()}年${now.getMonth() + 1}月最新】`;

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title")
    .eq("article_type", "invitation")
    .is("deleted_at", null);

  if (error) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500);

  let updated = 0;
  for (const article of articles ?? []) {
    const newTitle = TITLE_DATE_PREFIX.test(article.title)
      ? article.title.replace(TITLE_DATE_PREFIX, newPrefix)
      : `${newPrefix}${article.title}`;

    if (newTitle === article.title) continue;

    const { error: updateError } = await supabase.from("articles").update({ title: newTitle }).eq("id", article.id);
    if (!updateError) updated++;
  }

  return Response.json({ ok: true, updated, total: articles?.length ?? 0, prefix: newPrefix });
}
