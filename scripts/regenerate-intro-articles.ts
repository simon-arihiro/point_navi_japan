// 一次性バッチスクリプト：登録済み全Serviceの「紹介記事」を統一テンプレート（docs/introduction-article-format.md）で再生成し、
// 既存記事は内容を上書きして published のまま維持、未生成のServiceは新規 published で作成する。
//
// 実行方法（.env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY が必要）：
//   npx tsx --env-file=.env.local scripts/regenerate-intro-articles.ts
//
// 特定のServiceだけ試す場合は slug を引数で指定（複数可）：
//   npx tsx --env-file=.env.local scripts/regenerate-intro-articles.ts trima powl

import { createClient } from "@supabase/supabase-js";
import { generateText } from "../src/lib/ai/claude";
import { SYSTEM_PROMPT_BASE, buildIntroductionArticlePrompt, buildDescriptionPrompt } from "../src/lib/ai/prompts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です（.env.local を確認してください）");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY が必要です（.env.local を確認してください）");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const targetSlugs = process.argv.slice(2);

  let query = supabase
    .from("services")
    .select("id, name, slug, description, referral_code, referral_link, official_url")
    .order("name");

  if (targetSlugs.length > 0) {
    query = query.in("slug", targetSlugs);
  }

  const { data: services, error } = await query;
  if (error) throw error;
  if (!services?.length) {
    console.log("対象のServiceが見つかりませんでした");
    return;
  }

  console.log(`${services.length} 件のServiceを処理します\n`);

  for (const service of services) {
    console.log(`--- ${service.name} (${service.slug}) ---`);
    try {
      const content = (await generateText(SYSTEM_PROMPT_BASE, buildIntroductionArticlePrompt(service)))
        .replace(/^#\s+.+\n+/, "") // AIが誤ってh1タイトルを出力した場合の保険
        .trim();

      const title = `${service.name}を実際に使ってみた感想｜メリット・デメリット・始め方まとめ`;

      const description = (
        await generateText("SEO meta descriptionを150字以内で生成するアシスタントです。", buildDescriptionPrompt(title, content))
      ).trim();

      const { data: existing } = await supabase
        .from("articles")
        .select("id, published_at")
        .eq("primary_service_id", service.id)
        .eq("article_type", "introduction")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("articles")
          .update({
            title,
            content,
            description,
            status: "published",
            published_at: existing.published_at ?? new Date().toISOString(),
          })
          .eq("id", existing.id);
        console.log(`  更新しました (article_id=${existing.id})`);
      } else {
        const slug = `${service.slug ?? service.id}-introduction`;
        const { data: inserted } = await supabase
          .from("articles")
          .insert({
            primary_service_id: service.id,
            title,
            slug,
            content,
            description,
            article_type: "introduction",
            status: "published",
            published_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        console.log(`  新規作成しました (article_id=${inserted?.id})`);
      }
    } catch (err) {
      console.error(`  失敗: ${err}`);
    }
  }

  console.log("\n完了");
}

main();
