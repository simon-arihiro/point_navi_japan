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

  // 既存の招待コード記事・サービス紹介記事の本文に、サービス名見出しや招待コードの赤字強調（==...==）を一括適用する
  const { data: targetArticles, error: targetError } = await supabase
    .from("articles")
    .select("id, content, article_type, primary_service:services!articles_primary_service_id_fkey(name, referral_code)")
    .in("article_type", ["invitation", "introduction"])
    .is("deleted_at", null);

  if (targetError) return errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, targetError.message, 500);

  let contentUpdated = 0;
  for (const article of targetArticles ?? []) {
    const svc = article.primary_service as unknown as { name: string; referral_code: string | null } | null;
    if (!svc) continue;

    let content: string = article.content;
    let changed = false;

    if (article.article_type === "invitation") {
      const heading = `## 🎁 ${svc.name}の招待コード・紹介特典まとめ`;
      const highlightedHeading = `## 🎁 ==${svc.name}==の招待コード・紹介特典まとめ`;
      if (content.includes(heading) && !content.includes(highlightedHeading)) {
        content = content.replace(heading, highlightedHeading);
        changed = true;
      }
    }

    if (svc.referral_code) {
      const code = svc.referral_code;
      const highlightedCode = `==${code}==`;
      if (content.includes(code) && !content.includes(highlightedCode)) {
        content = content.replace(code, highlightedCode);
        changed = true;
      }
    }

    if (!changed) continue;

    const { error: updateError } = await supabase.from("articles").update({ content }).eq("id", article.id);
    if (!updateError) contentUpdated++;
  }

  return Response.json({ ok: true, updated, total: articles?.length ?? 0, prefix: newPrefix, contentUpdated });
}
