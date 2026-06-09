export const SYSTEM_PROMPT_BASE = `あなたは日本のポイ活・招待コードサイトの個人ブロガーとして記事を書いています。
語気：個人ブロガーの体験談風、口語的で親しみやすく温かみのある表現。
禁止：公式宣伝語気、過度に丁寧な企業PRスタイル。
目標：読者が「日本人が実際に使って本当に勧めている」と自然に感じる内容。
必須表現を自然に散りばめる：「実際に使ってみた」「正直なところ」「これは本当におすすめ」
出力言語：日本語のみ。`;

export function buildServiceInfoPrompt(officialUrl: string) {
  return `以下の公式サイトURLを参照して、サービス情報をJSON形式で返してください。
URL: ${officialUrl}

返却するJSON形式：
{
  "name": "サービス名（日本語）",
  "slug": "url-friendly-slug（英小文字・ハイフン区切り）",
  "description": "SEO meta description（150字以内・日本語）",
  "categories": ["カテゴリ名1", "カテゴリ名2"],
  "tags": ["タグ1", "タグ2", "タグ3"]
}

注意：JSONのみ返却してください。`;
}

export function buildIntroductionArticlePrompt(service: {
  name: string;
  description: string;
  referral_code: string | null;
  referral_link: string | null;
  official_url: string;
}) {
  return `「${service.name}」のサービス紹介記事を書いてください。

サービス情報：
- 公式URL: ${service.official_url}
- 概要: ${service.description}
${service.referral_code ? `- 紹介コード: ${service.referral_code}` : ""}
${service.referral_link ? `- 紹介リンク: ${service.referral_link}` : ""}

記事要件：
- Markdown形式
- 2000〜3000字
- 構成：サービス概要 → 実際に使ってみた感想 → メリット・デメリット → 始め方・紹介コードの使い方 → まとめ
- 個人ブロガーの体験談として書く
- 紹介コードや紹介リンクを自然に案内する

最初の行にタイトル（# タイトル）を含めてください。`;
}

export function buildRelatedArticlePrompt(
  service: { name: string; description: string },
  articleType: "guide" | "faq" | "comparison" | "campaign" | "earnings"
) {
  const typeGuide = {
    guide: "使い方・攻略ガイド",
    faq: "よくある質問（FAQ）",
    comparison: "他サービスとの比較",
    campaign: "キャンペーン情報",
    earnings: "実際の収益・ポイント獲得実績",
  }[articleType];

  return `「${service.name}」に関する「${typeGuide}」の記事を書いてください。

サービス概要：${service.description}

記事要件：
- Markdown形式
- 1500〜2500字
- 個人ブロガーの体験談として書く
- 実用的で読者が行動したくなる内容

最初の行にタイトル（# タイトル）を含めてください。`;
}

export function buildRewritePrompt(originalContent: string, feedback: string) {
  return `以下の記事を管理者のフィードバックに基づいて書き直してください。

【フィードバック】
${feedback}

【元の記事】
${originalContent}

同じMarkdown形式で書き直してください。`;
}

export function buildDescriptionPrompt(title: string, content: string) {
  return `以下の記事のSEO meta descriptionを150字以内で生成してください。
タイトル：${title}
本文の冒頭：${content.substring(0, 300)}

descriptionのみ返してください（マークダウン不要）。`;
}
