// 「AI記事生成」で管理者が入力した参考情報（プロンプト・参考ページ・添付画像）
export type ExtraContext = {
  userPrompt?: string;
  webContents?: { url: string; content: string | null }[];
  imageUrls?: string[];
};

// 管理者からの参考情報をプロンプト冒頭に挿入するセクションを構築する（最優先指示として扱う）
function buildExtraContextSection(extra?: ExtraContext): string {
  if (!extra) return "";
  const parts: string[] = [];

  if (extra.userPrompt?.trim()) {
    parts.push(`【最優先指示】管理者から以下の指示・参考情報が提供されています。記事の構成や文字数の目安は維持しつつ、内容にはこの指示を最優先で反映してください。\n${extra.userPrompt.trim()}`);
  }

  const validWebContents = (extra.webContents ?? []).filter((w) => w.content);
  if (validWebContents.length > 0) {
    const sections = validWebContents.map((w) => `--- ${w.url} の内容 ---\n${w.content}`).join("\n\n");
    parts.push(`【参考ページの内容】\n${sections}`);
  }

  if (extra.imageUrls?.length) {
    const urlList = extra.imageUrls.map((u, i) => `${i + 1}. ${u}`).join("\n");
    parts.push(`【添付画像】上記の最優先指示の中で、各画像を本文に挿入するか・執筆の参考情報として使うのみかが説明されています。本文に挿入する場合は、Markdown形式 ![説明](画像URL) で本文中の適切な位置に挿入してください。\n画像URL一覧（添付順）：\n${urlList}`);
  }

  if (parts.length === 0) return "";
  return `${parts.join("\n\n")}\n\n以上を踏まえて、以下の指示に従って記事を作成してください。\n\n---\n\n`;
}

export const SYSTEM_PROMPT_BASE = `あなたは日本のポイ活・招待コードサイトの個人ブロガーとして記事を書いています。
語気：個人ブロガーの体験談風、口語的で親しみやすく温かみのある表現。
禁止：公式宣伝語気、過度に丁寧な企業PRスタイル。
目標：読者が「日本人が実際に使って本当に勧めている」と自然に感じる内容。
必須表現を自然に散りばめる：「実際に使ってみた」「正直なところ」「これは本当におすすめ」
出力言語：日本語のみ。`;

export function buildServiceInfoPrompt(serviceName: string, officialUrl: string | null, existingCategories: string[], pageContent?: string | null) {
  const categoryList = existingCategories.length > 0 ? existingCategories.join("、") : "（登録済みカテゴリなし）";

  const sourceSection = pageContent
    ? `以下は公式サイト（${officialUrl}）から取得したページ内容です。この内容を参考情報として活用してください。\n--- ページ内容 ---\n${pageContent}\n--- ページ内容ここまで ---`
    : officialUrl
      ? `指定された公式URL（${officialUrl}）からはページ内容を取得できませんでした。下記のWeb検索でサービス名をもとに情報を調査してください。`
      : `公式URLは指定されていません。下記のWeb検索でサービス名をもとに公式サイトや関連情報を調査してください。`;

  return `あなたはポイ活サービスの情報を調査・整理するAIアシスタントです。サービス情報をWeb検索で調査し、JSON形式で返してください。
調査対象のサービス名：「${serviceName}」
${officialUrl ? `公式URL（参考情報。誤っている可能性もあるため、検索結果と矛盾する場合は検索結果を優先してください）: ${officialUrl}` : "公式URL：不明"}

${sourceSection}

Web検索では、サービス名「${serviceName}」を中心に、以下のようなキーワードで調査してください：
- 「${serviceName} 公式サイト」（公式URLの特定・サービス概要の確認）
- 「${serviceName} 友達紹介 ポイント」「${serviceName} 紹介コード キャンペーン」（紹介特典・キャンペーン情報の確認）
公式サイトのトップページに情報がなくても、紹介・キャンペーン専用ページやレビュー記事から判明することがあります。

既存カテゴリ一覧（categoriesはこの中からのみ選択可能）：
${categoryList}

返却するJSON形式：
{
  "name": "サービス名（日本語、正式名称）",
  "slug": "url-friendly-slug（英小文字・ハイフン区切り）。公式URL（指定されたもの、または検索で見つけたもの）のドメイン名やパスに含まれる、サービスを表す英語表記を最優先で使用してください（例: https://example.com/torima なら 'torima'）。該当する英語表記が見つからない場合は、サービス名のローマ字表記を使用してください",
  "official_url": "検索で特定した公式サイトのURL。確信が持てない場合は null",
  "description": "SEO meta description（150字以内・日本語）",
  "categories": ["既存カテゴリ一覧の中から該当するものだけを選択（複数可、なければ空配列）"],
  "tags": ["タグ1", "タグ2", "タグ3"],
  "bonus_points": "新規登録・新規ダウンロードで付与されるポイント数（数値）。確信が持てない場合は null",
  "bonus_amount": "上記ポイントの円相当額、またはポイント以外で付与される特典の金額目安（\"25〜30\"のような範囲表記も可）。確信が持てない場合は null",
  "campaign_bonus": "現在実施中のキャンペーン内容（例: 期間限定+1,000pt）。確信が持てない場合は null",
  "campaign_expires_at": "キャンペーン終了日時（YYYY-MM-DD形式）。確信が持てない場合は null",
  "logo_url": "サービスロゴ画像の直接URL。確信が持てない場合は null"
}

注意：
- 「アクセスできません」「わかりません」のような断り書きは一切不要です。name, slug, description, tags は必ず値を埋めてください。
- categories は必ず上記の「既存カテゴリ一覧」に記載されている名称と完全一致するものだけを選んでください。一覧にない新しいカテゴリ名を作成・出力することは禁止です。該当するものがなければ空配列 [] にしてください。
- official_url, bonus_points, bonus_amount, campaign_bonus, campaign_expires_at, logo_url は正確な情報に確信が持てる場合のみ値を入れ、不確かな場合は必ず null にしてください（架空の値を作らないこと）。
- 検索結果を参照した場合も、引用・出典・脚注などは含めず、前置きや補足説明、コードブロック記号（\`\`\`）も付けず、JSONオブジェクトのみを出力してください。`;
}

export function buildIntroductionArticlePrompt(service: {
  name: string;
  description: string;
  referral_code: string | null;
  referral_link: string | null;
  official_url: string;
}, extra?: ExtraContext) {
  const referralGuide =
    service.referral_code || service.referral_link
      ? "「🚀 登録方法・始め方」の最後のステップで、紹介コード・紹介リンクの使い方を自然に案内してください。"
      : "紹介コード・紹介リンクは提供されていないため、公式サイトからの通常の登録手順のみを案内してください。";

  return `${buildExtraContextSection(extra)}「${service.name}」のサービス紹介記事の本文を書いてください。
このサイトのすべてのサービス紹介記事は同じテンプレートで統一しています。下記の見出し（##）の文言・絵文字・順番・レベルは一字一句変えずに使ってください。タイトル（h1 / # ）は不要です。本文は「## 📝 ...」から始めてください。

サービス情報：
- 公式URL: ${service.official_url}
- 概要: ${service.description}
${service.referral_code ? `- 紹介コード: ${service.referral_code}` : ""}
${service.referral_link ? `- 紹介リンク: ${service.referral_link}` : ""}

【出力する見出しと内容】

## 📝 ${service.name}とはどんなサービス？
運営会社やサービスの基本概要、どんな人におすすめかを簡潔に（250〜350字）。

## 💬 実際に使ってみた感想
個人ブロガー視点で、使い始めたきっかけや率直な感想を体験談として（500〜700字）。

## ✅ メリット
箇条書き3〜5個（各1〜2文、具体的に）。

## ⚠️ デメリット・注意点
箇条書き2〜3個（各1〜2文、具体的に）。

## 🚀 登録方法・始め方
3〜5ステップの番号付きリストで登録手順を説明（300〜450字）。${referralGuide}

## 📌 まとめ
記事全体の総括とおすすめ度を一言で（150〜250字）。

【厳守事項】
- 見出し（##）はテキスト・絵文字・順番をすべて上記の通りにすること
- 箇条書きは「- 」、番号付きリストは「1. 」のように半角数字+ピリオドを使うこと
- 全体で2000〜3000字程度
- 個人ブロガーの体験談として書く${DESCRIPTION_SUFFIX_INSTRUCTION}`;
}

export function buildInvitationArticlePrompt(service: {
  name: string;
  description: string;
  referral_code: string | null;
  referral_link: string | null;
  bonus_points: number | null;
  bonus_amount: string | null;
  campaign_bonus: string | null;
  official_url: string;
}, extra?: ExtraContext) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  const codeSection = service.referral_code
    ? `招待コード: ${service.referral_code}`
    : service.referral_link
      ? "招待コードはなし。招待リンク経由でのみ特典が受け取れます"
      : "招待コード・招待リンクは未登録（一般的な登録方法のみ案内してください）";

  const infoLines = [
    `公式URL: ${service.official_url}`,
    `概要: ${service.description}`,
    codeSection,
  ];
  if (service.bonus_points) infoLines.push(`新規登録特典: ${service.bonus_points.toLocaleString()}pt`);
  if (service.bonus_amount) infoLines.push(`特典の金額目安: 約${service.bonus_amount}円相当`);
  if (service.campaign_bonus) infoLines.push(`現在実施中のキャンペーン: ${service.campaign_bonus}`);

  return `${buildExtraContextSection(extra)}「${service.name}」の招待コード・友達紹介キャンペーンを紹介する記事の本文を書いてください。
このサイトのすべての招待コード記事は同じテンプレートで統一しています。下記の見出し（##）の文言・絵文字・順番・レベルは一字一句変えずに使ってください。

最初の行に、以下の形式でタイトル（# ）を出力してください：
# 【${yearMonth}最新】${service.name}の招待コード・紹介特典まとめ｜登録方法と受け取り方を解説

サービス情報：
${infoLines.map((l) => `- ${l}`).join("\n")}

【出力する見出しと内容】

## 🎁 ${service.name}の招待コード・紹介特典まとめ
この招待コード・紹介リンクを使うとどんな特典が受け取れるかを、具体的な金額・ポイント数を交えて紹介（200〜300字）。

## 📋 招待コード・招待リンクの使い方
登録時に招待コードを入力する手順、または招待リンクから登録する手順を3〜5ステップの番号付きリストで説明（300〜450字）。

## 💰 もらえる特典の詳細
新規登録特典・キャンペーン特典の受け取り条件や反映タイミングなどを説明（250〜350字）。

## ⚠️ 利用時の注意点
招待コードの有効期限、入力タイミング（後から入力できない場合が多い等）、一人一回までなどの注意点を箇条書き2〜3個で（各1〜2文）。

## 📌 まとめ
記事全体の総括と、今すぐ登録すべき理由を一言で（150〜250字）。

【厳守事項】
- 1行目は必ず「# 」から始まるタイトル行にすること
- 見出し（##）はテキスト・絵文字・順番をすべて上記の通りにすること
- 箇条書きは「- 」、番号付きリストは「1. 」のように半角数字+ピリオドを使うこと
- 全体で1500〜2200字程度
- 個人ブロガーの体験談として書く${DESCRIPTION_SUFFIX_INSTRUCTION}`;
}

export function buildRelatedArticlePrompt(
  service: { name: string; description: string },
  articleType: "guide" | "faq" | "comparison" | "campaign" | "earnings",
  extra?: ExtraContext
) {
  const typeGuide = {
    guide: "使い方・攻略ガイド",
    faq: "よくある質問（FAQ）",
    comparison: "他サービスとの比較",
    campaign: "キャンペーン情報",
    earnings: "実際の収益・ポイント獲得実績",
  }[articleType];

  return `${buildExtraContextSection(extra)}「${service.name}」に関する「${typeGuide}」の記事を書いてください。

サービス概要：${service.description}

記事要件：
- Markdown形式
- 1500〜2500字
- 個人ブロガーの体験談として書く
- 実用的で読者が行動したくなる内容

最初の行にタイトル（# タイトル）を含めてください。${DESCRIPTION_SUFFIX_INSTRUCTION}`;
}

export function buildRewritePrompt(originalContent: string, feedback: string) {
  return `以下の記事を管理者のフィードバックに基づいて書き直してください。

【フィードバック】
${feedback}

【元の記事】
${originalContent}

同じMarkdown形式で書き直してください。`;
}

// 本文生成プロンプトの末尾に付与する指示。本文とSEO meta descriptionを1回のAI呼び出しでまとめて生成させる
export const DESCRIPTION_SUFFIX_INSTRUCTION = `

【SEO meta description】
本文をすべて出力したあと、最後に区切り行 "---META_DESCRIPTION---" を出力し、その次の行にこの記事のSEO meta description（150字以内・日本語・マークダウン不要）を出力してください。`;

const DESCRIPTION_DELIMITER = /\n*---META_DESCRIPTION---\n*/;

// AIの出力を本文とSEO meta descriptionに分割する。区切りが見つからない場合はdescriptionを空文字で返す
export function splitContentAndDescription(raw: string): { content: string; description: string } {
  const parts = raw.split(DESCRIPTION_DELIMITER);
  if (parts.length < 2) return { content: raw.trim(), description: "" };
  return { content: parts[0].trim(), description: parts.slice(1).join("").trim() };
}
