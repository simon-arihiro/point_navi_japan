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

// Geminiで画像を生成してStorageに保存し、公開URLを返す。
// 無料枠の上限などで生成に失敗した場合はnullを返す。
export async function generateThumbnailImage(prompt: string, serviceId: string): Promise<string | null> {
  const image = await generateImage(prompt);
  if (!image) return null;

  return uploadArticleImage(serviceId, image.data, image.mimeType);
}

const FIRST_IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/;

// 本文内の最初の画像リンクを新しいURLに置き換える。画像が無ければnullを返す
export function replaceFirstImageUrl(content: string, newUrl: string): string | null {
  if (!FIRST_IMAGE_RE.test(content)) return null;
  return content.replace(FIRST_IMAGE_RE, (_match, alt) => `![${alt}](${newUrl})`);
}
