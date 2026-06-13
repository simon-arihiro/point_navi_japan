import { createAdminClient } from "@/lib/supabase/server";
import { errorResponse, ErrorCode } from "@/lib/errors";

// 招待コード記事タイトル先頭の「【YYYY年M月最新】」（旧形式の「【YYYY年M月】」も含む）を現在の年月に一括更新する
const TITLE_DATE_PREFIX = /^【\d{4}年\d{1,2}月(?:最新)?】/;

// 旧テンプレートの文言を新テンプレートに揃える（一度切り替わった後はOLD_BODYに一致しないため無害）
const OLD_BODY = "の招待コード・紹介キャンペーンまとめ｜登録方法と特典の受け取り方を解説";
const NEW_BODY = "の招待コード・紹介特典まとめ｜登録方法と受け取り方を解説";

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
    const rest = article.title.replace(TITLE_DATE_PREFIX, "").replace(OLD_BODY, NEW_BODY);
    const newTitle = `${newPrefix}${rest}`;

    if (newTitle === article.title) continue;

    const { error: updateError } = await supabase.from("articles").update({ title: newTitle }).eq("id", article.id);
    if (!updateError) updated++;
  }

  return Response.json({ ok: true, updated, total: articles?.length ?? 0, prefix: newPrefix });
}
