export const SYSTEM_PROMPT_BASE = `あなたは日本のポイ活・招待コードサイトの個人ブロガーとして記事を書いています。
語気：個人ブロガーの体験談風、口語的で親しみやすく温かみのある表現。
禁止：公式宣伝語気、過度に丁寧な企業PRスタイル。
目標：読者が「日本人が実際に使って本当に勧めている」と自然に感じる内容。
必須表現を自然に散りばめる：「実際に使ってみた」「正直なところ」「これは本当におすすめ」
出力言語：日本語のみ。`;

export function buildServiceInfoPrompt(officialUrl: string, existingCategories: string[]) {
  const categoryList = existingCategories.length > 0 ? existingCategories.join("、") : "（登録済みカテゴリなし）";

  return `あなたはこのURLに直接アクセスすることはできません。URLのドメイン名やパス、サービス名から推測できる一般的な知識をもとに、サービス情報を推測してJSON形式で返してください。
URL: ${officialUrl}

既存カテゴリ一覧（categoriesはこの中からのみ選択可能）：
${categoryList}

返却するJSON形式：
{
  "name": "サービス名（日本語、推測でよい）",
  "slug": "url-friendly-slug（英小文字・ハイフン区切り）",
  "description": "SEO meta description（150字以内・日本語）",
  "categories": ["既存カテゴリ一覧の中から該当するものだけを選択（複数可、なければ空配列）"],
  "tags": ["タグ1", "タグ2", "タグ3"],
  "campaign_bonus": "現在実施中のキャンペーン内容（例: 期間限定+1,000pt）。確信が持てない場合は null",
  "campaign_expires_at": "キャンペーン終了日時（YYYY-MM-DD形式）。確信が持てない場合は null",
  "logo_url": "サービスロゴ画像の直接URL。確信が持てない場合は null"
}

注意：
- 「アクセスできません」「わかりません」のような断り書きは一切不要です。name, slug, description, tags は必ず推測で値を埋めてください。
- categories は必ず上記の「既存カテゴリ一覧」に記載されている名称と完全一致するものだけを選んでください。一覧にない新しいカテゴリ名を作成・出力することは禁止です。該当するものがなければ空配列 [] にしてください。
- campaign_bonus, campaign_expires_at, logo_url は正確な情報に確信が持てる場合のみ値を入れ、不確かな場合は必ず null にしてください（架空の金額や日付を作らないこと）。
- 前置きや補足説明、コードブロック記号（\`\`\`）は付けず、JSONオブジェクトのみを出力してください。`;
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
