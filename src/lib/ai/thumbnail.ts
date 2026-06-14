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

// すべてのサムネイル生成で共通の厳守事項。AIプロンプトライブラリのデフォルトプロンプトの有無に関わらず常に付与する
// 画像生成AIは日本語の文字を正確に描けず文字化けするため、文字・ロゴ・タイトル等は一切含めない
const THUMBNAIL_GENERAL_RULES = `【厳守事項】
- 画像内には文字・ロゴ・タイトル・キャッチコピー・ウォーターマークなどのテキスト要素を一切含めないこと
- これは上記のスタイル指定の内容に関わらず、必ず最優先で守ること
- イラスト・写真・図形・アイコンなどのビジュアル要素のみで構成すること
- 記事タイトルはWebページ側で別途テキストとして表示されるため、画像内に描き込む必要はない`;

// 記事のアイキャッチ画像用のGeminiプロンプトを生成する。
// defaultStyleはAIプロンプトライブラリ（サムネイル用）でデフォルト設定されたスタイル指示。指定時は基本スタイル指定の代わりに使用する
export function buildThumbnailPrompt(serviceName: string, articleType: ArticleType, title: string, defaultStyle?: string): string {
  const theme = ARTICLE_TYPE_THEME[articleType] ?? "";

  const styleSection = defaultStyle?.trim()
    ? `スタイル指定:\n${defaultStyle.trim()}`
    : `スタイル指定:
- 親しみやすいフラットデザインのイラスト
- 暖色系（オレンジ・ゴールド・黄色）を基調とした配色
- スマホ・ポイントカード・コインなどのモチーフを使ってもよい
- 文字・ロゴ・ブランド名・ウォーターマークは一切含めない
- 16:9の横長構図、シンプルな背景`;

  return `日本のポイ活（ポイント活動）ブログ記事用のアイキャッチ画像を1枚生成してください。
記事タイトル: 「${title}」
対象サービス: ${serviceName}
イメージ: ${theme}

${styleSection}

${THUMBNAIL_GENERAL_RULES}`;
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

// 本文先頭の画像（既存のアイキャッチ等）にマッチする正規表現
const LEADING_IMAGE_RE = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*\n+/;

// 生成したアイキャッチ画像を必ず本文の最前面に配置する。
// 本文が既に画像から始まっている場合はその画像を新しいものに置き換え、
// そうでない場合は先頭に新しい画像を追加する
export function placeImageAtTop(content: string, title: string, newUrl: string): string {
  const trimmed = content.trimStart();
  const image = `![${title}](${newUrl})`;
  if (LEADING_IMAGE_RE.test(trimmed)) {
    return trimmed.replace(LEADING_IMAGE_RE, `${image}\n\n`);
  }
  return `${image}\n\n${trimmed}`;
}
