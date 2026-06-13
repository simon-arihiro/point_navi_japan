import { SupabaseClient } from "@supabase/supabase-js";
import { generateImage } from "./gemini";
import { uploadArticleImage } from "@/lib/storage";
import { ArticleType } from "@/types/database";

const ARTICLE_TYPE_THEME: Record<ArticleType, string> = {
  introduction: "サービスの基本的な特徴・使い方をイメージさせるイラスト",
  guide: "使い方・手順を案内しているイメージ",
  faq: "疑問やQ&Aに答えているイメージ",
  comparison: "複数の選択肢を見比べているイメージ",
  campaign: "お得なキャンペーンやボーナスをイメージさせるイラスト",
  earnings: "ポイントやお金がどんどん貯まっていくイメージ",
};

// 記事のアイキャッチ画像用のGeminiプロンプトを生成する
export function buildThumbnailPrompt(serviceName: string, articleType: ArticleType, title: string): string {
  const theme = ARTICLE_TYPE_THEME[articleType] ?? "";

  return `日本のポイ活（ポイント活動）ブログ記事用のアイキャッチ画像を1枚生成してください。
記事タイトル: 「${title}」
対象サービス: ${serviceName}
イメージ: ${theme}

スタイル指定:
- 親しみやすいフラットデザインのイラスト
- 暖色系（オレンジ・ゴールド・黄色）を基調とした配色
- スマホ・ポイントカード・コインなどのモチーフを使ってもよい
- 文字・ロゴ・ブランド名・ウォーターマークは一切含めない
- 16:9の横長構図、シンプルな背景`;
}

// Geminiで画像を生成し、Storageに保存して記事のfeatured_image_urlを更新する。
// 無料枠の上限などで生成に失敗した場合はnullを返す（記事生成自体は失敗させない）。
export async function generateAndSaveThumbnail(
  supabase: SupabaseClient,
  articleId: string,
  serviceId: string,
  prompt: string
): Promise<string | null> {
  const image = await generateImage(prompt);
  if (!image) return null;

  const url = await uploadArticleImage(serviceId, image.data, image.mimeType);
  if (!url) return null;

  await supabase.from("articles").update({ featured_image_url: url }).eq("id", articleId);
  return url;
}
