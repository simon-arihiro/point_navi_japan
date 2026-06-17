import { createAdminClient } from "@/lib/supabase/server";
import { postTweet } from "./x";
import type { DistributionPlatform, SnsPlatformSettings } from "@/types/database";

// 記事を指定したプラットフォームへ手動配信する。結果をdistribution_logsに記録して返す
export async function distributeArticle(articleId: string, platform: DistributionPlatform) {
  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, status, primary_service:services!articles_primary_service_id_fkey(categories:service_categories(category:categories(slug)))")
    .eq("id", articleId)
    .single();

  if (!article) throw new Error("記事が見つかりません");

  const { data: log } = await supabase
    .from("distribution_logs")
    .insert({ article_id: articleId, platform, status: "pending" })
    .select()
    .single();

  const { data: settingsRow } = await supabase.from("system_settings").select("sns_platform_settings").eq("id", 1).single();
  const platformSettings = (settingsRow?.sns_platform_settings as SnsPlatformSettings | null)?.[platform];

  let result: { ok: boolean; error?: string };

  if (!platformSettings?.enabled) {
    result = { ok: false, error: "このプラットフォームは無効化されています。設定画面で有効化してください" };
  } else {
    const service = article.primary_service as any;
    const categorySlug = service?.categories?.[0]?.category?.slug ?? "all";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jp-point-navi.com";
    const url = `${siteUrl}/articles/${categorySlug}/${article.slug}`;
    const text = `${article.title}\n${url}`;

    if (platform === "x") {
      result = await postTweet(text, platformSettings.credentials as any);
    } else {
      result = { ok: false, error: "このプラットフォームの配信機能は未実装です" };
    }
  }

  const { data: updatedLog } = await supabase
    .from("distribution_logs")
    .update({
      status: result.ok ? "success" : "failed",
      error_message: result.ok ? null : (result.error ?? "不明なエラー"),
      distributed_at: new Date().toISOString(),
    })
    .eq("id", log!.id)
    .select()
    .single();

  return { ...result, log: updatedLog };
}
