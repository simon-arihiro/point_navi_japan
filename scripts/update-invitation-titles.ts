// 一次性スクリプト：既存の招待コード記事タイトルを新テンプレートに統一する
// 旧: 【YYYY年M月】サービス名の招待コード・紹介キャンペーンまとめ｜登録方法と特典の受け取り方を解説
// 新: 【YYYY年M月最新】サービス名の招待コード・紹介特典まとめ｜登録方法と受け取り方を解説
//
// 実行方法（.env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要）：
//   npx tsx --env-file=.env.local scripts/update-invitation-titles.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です（.env.local を確認してください）");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OLD_FORMAT = /^【(\d{4}年\d{1,2}月)】(.+)の招待コード・紹介キャンペーンまとめ｜登録方法と特典の受け取り方を解説$/;

async function main() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title")
    .eq("article_type", "invitation")
    .is("deleted_at", null);

  if (error) throw error;
  if (!articles?.length) {
    console.log("対象の招待コード記事が見つかりませんでした");
    return;
  }

  for (const article of articles) {
    const match = article.title.match(OLD_FORMAT);
    if (!match) {
      console.log(`スキップ（旧形式に一致しません）: ${article.title}`);
      continue;
    }

    const [, yearMonth, serviceName] = match;
    const newTitle = `【${yearMonth}最新】${serviceName}の招待コード・紹介特典まとめ｜登録方法と受け取り方を解説`;

    const { error: updateError } = await supabase.from("articles").update({ title: newTitle }).eq("id", article.id);
    if (updateError) {
      console.error(`  失敗 (${article.id}): ${updateError.message}`);
    } else {
      console.log(`更新: ${article.title}\n  -> ${newTitle}`);
    }
  }

  console.log("\n完了");
}

main();
