import sharp from "sharp";
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
// 画像が生成できなかった場合はnullを返す。
// プロバイダーによる出力サイズの違いを吸収するため、PNG・THUMBNAIL_WIDTH x THUMBNAIL_HEIGHT（16:9）に正規化する
export async function generateThumbnailImage(prompt: string, serviceId: string): Promise<string | null> {
  const image = await generateTaskImage(prompt);
  if (!image) return null;

  const normalized = await sharp(Buffer.from(image.data, "base64"))
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: "cover" })
    .png()
    .toBuffer();

  return uploadArticleImage(serviceId, normalized.toString("base64"), "image/png");
}

const FIRST_IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/;

// 本文内の最初の画像リンクを新しいURLに置き換える。画像が無ければnullを返す
export function replaceFirstImageUrl(content: string, newUrl: string): string | null {
  if (!FIRST_IMAGE_RE.test(content)) return null;
  return content.replace(FIRST_IMAGE_RE, (_match, alt) => `![${alt}](${newUrl})`);
}
