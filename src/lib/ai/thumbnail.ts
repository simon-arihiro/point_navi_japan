import { generateTaskImage } from "./router";
import { uploadArticleImage } from "@/lib/storage";
import { ArticleType } from "@/types/database";

// 記事アイキャッチ画像の固定サイズ（16:9）。AIプロバイダーに関わらずこのサイズに統一する
export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;

const ARTICLE_TYPE_THEME: Record<ArticleType, string> = {
  introduction: "サービスの基本的な特徴・使い方をイメージさせるイラスト",
  guide: "使い方・手順を案内しているイメージ",
  faq: "疑問やQ&Aに答えているイメージ",
  comparison: "複数の選択肢を見比べているイメージ",
  campaign: "お得なキャンペーンやボーナスをイメージさせるイラスト",
  earnings: "ポイントやお金がどんどん貯まっていくイメージ",
  invitation: "招待コード・プレゼントでお得な特典を受け取るイメージ",
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

// 設定されたAIプロバイダーで画像を生成してStorageに保存し、公開URLを返す。
// 失敗時はエラーを投げる（呼び出し元でimage_failed通知として記録される）。
// アスペクト比はAIプロバイダーへのプロンプト指定（16:9）に依存し、生成結果をそのまま保存する
export async function generateThumbnailImage(prompt: string, serviceId: string): Promise<string> {
  const image = await generateTaskImage(prompt);
  if (!image) throw new Error("画像生成APIから画像データが返されませんでした");

  const url = await uploadArticleImage(serviceId, image.data, image.mimeType);
  if (!url) throw new Error("生成した画像のStorageへのアップロードに失敗しました");

  return url;
}

const FIRST_IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/;

// 本文内の最初の画像リンクを新しいURLに置き換える。画像が無ければnullを返す
export function replaceFirstImageUrl(content: string, newUrl: string): string | null {
  if (!FIRST_IMAGE_RE.test(content)) return null;
  return content.replace(FIRST_IMAGE_RE, (_match, alt) => `![${alt}](${newUrl})`);
}
