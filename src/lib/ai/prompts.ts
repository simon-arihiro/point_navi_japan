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
    parts.push(`【最優先指示】管理者から以下の指示・参考情報が提供されています。記事の構成や文字数の目安は維持しつつ、内容にはこの指示を最優先で反映してください。
${extra.userPrompt.trim()}

上記の指示の中に見出し・目次・章立てのようなリスト（例：「1. ◯◯について」「## ◯◯のメリット」など）が含まれている場合、それは記事に含めるべきテーマの「方向性」を示す参考情報として扱ってください。その際は以下の方針に従ってください：
- 見出しの文言をそのまま転載せず、記事全体の流れに合わせて言い回しを調整・言い換えること
- 各テーマについては、提示された目次の文言だけに頼らず、Web検索で最新情報を調査した上で執筆すること
- 記事全体の論理構成として不要・重複していると判断した項目は省略してよく、逆に読者にとって有益だと判断した項目を追加してもよい（項目数は増減可）
- ただし、記事テンプレートとして固定の見出し構成が別途指定されている場合は、そちらの見出し構成を優先し、この目次は各見出しの内容を充実させるための参考情報として扱うこと`);
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

export const SYSTEM_PROMPT_BASE = `あなたは日本のポイ活・招待コードサイト「ポイナビ」のマスコットキャラクター「りすくん」として記事を書いています。
語気：りすくんの体験談風、口語的で親しみやすく温かみのある表現。
禁止：公式宣伝語気、過度に丁寧な企業PRスタイル。
禁止：「まゆ」のような自分以外の人物名・ペルソナを名乗ること。自己紹介をする場合は「りすくん」と名乗ること。
目標：読者が「りすくんが実際に使って本当に勧めている」と自然に感じる内容。
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
      ? `「🚀 登録方法・始め方」の最後のステップで、紹介コード・紹介リンクの使い方を自然に案内してください。${service.referral_code ? `紹介コード「${service.referral_code}」を記載する箇所は、バッククォートやコードブロックで囲まず、==${service.referral_code}== の形式（半角イコール2つで前後を囲む）でそのまま記述してください。` : ""}`
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
- \`==テキスト==\` は赤字強調表示になる特別な記法です。指示された箇所以外では使用しないこと
- 全体で2000〜3000字程度
- 個人ブロガーの体験談として書く${DESCRIPTION_SUFFIX_INSTRUCTION}`;
}

// 招待コード一覧ページのカードに表示する2行キャッチコピーのみを生成するプロンプト（既存サービスの一括バックフィル用）
export function buildCatchCopyPrompt(service: {
  name: string;
  description: string;
  bonus_points: number | null;
  bonus_amount: string | null;
  campaign_bonus: string | null;
}) {
  return `「${service.name}」の招待コード一覧ページのカードに表示するキャッチコピーを作成してください。

- サービス概要: ${service.description}

${CATCH_COPY_RULES}`;
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
# 【${yearMonth}最新】${service.name}の◯◯◯◯
「【${yearMonth}最新】${service.name}の」の部分は固定で必ずこの通りにすること。それに続く「◯◯◯◯」の部分は、このサービスの招待コード・紹介特典の特徴（ポイント数、金額、キャンペーン内容など）を踏まえて、他のサービスのタイトルと文言が被らないように毎回言い回しを変えること。例：「招待コードまとめ｜お得な受け取り方」「紹介キャンペーンを徹底解説」「招待コード活用で得する方法」など、20字程度で自由に作成してOK。

サービス情報：
${infoLines.map((l) => `- ${l}`).join("\n")}

【出力する見出しと内容】

## 🎁 ==${service.name}==の招待コード・紹介特典まとめ
この招待コード・紹介リンクを使うとどんな特典が受け取れるかを、具体的な金額・ポイント数を交えて紹介（200〜300字）。

## 📋 招待コード・招待リンクの使い方
登録時に招待コードを入力する手順、または招待リンクから登録する手順を3〜5ステップの番号付きリストで説明（300〜450字）。${service.referral_code ? `招待コード「${service.referral_code}」を記載する箇所は、バッククォートやコードブロックで囲まず、==${service.referral_code}== の形式（半角イコール2つで前後を囲む）でそのまま記述してください。` : ""}

## 💰 もらえる特典の詳細
新規登録特典・キャンペーン特典の受け取り条件や反映タイミングなどを説明（250〜350字）。

## ⚠️ 利用時の注意点
招待コードの有効期限、入力タイミング（後から入力できない場合が多い等）、一人一回までなどの注意点を箇条書き2〜3個で（各1〜2文）。

## 📌 まとめ
記事全体の総括と、今すぐ登録すべき理由を一言で（150〜250字）。

【厳守事項】
- 1行目は必ず「# 」から始まるタイトル行にすること
- 見出し（##）はテキスト・絵文字・順番をすべて上記の通りにすること（ただし「## 🎁 」の見出し内の \`==${service.name}==\` は指示通りそのまま残すこと）
- 箇条書きは「- 」、番号付きリストは「1. 」のように半角数字+ピリオドを使うこと
- \`==テキスト==\` は赤字強調表示になる特別な記法です。指示された箇所以外では使用しないこと
- 「登録はこちら」「ぜひ使ってみてください」のような登録を促す文言は、記事全体で合計2回程度まで（##🎁の見出しと📋の使い方セクションなど）に留め、他の見出しでは繰り返さないこと。読者に何度も勧誘している印象を与えないようにする
- 招待コード「${service.referral_code}」自体の記載も、記事全体で合計2回まで（##🎁の見出しと📋の使い方セクションのみ）に留めること。それ以外の見出しでは「招待コード」「上記のコード」のように言葉で言及するだけにし、コード番号そのものを繰り返し書かないこと
- 全体で1500〜2200字程度
- 個人ブロガーの体験談として書く${DESCRIPTION_SUFFIX_INSTRUCTION}${CATCH_COPY_SUFFIX_INSTRUCTION}`;
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

export function buildRewritePrompt(originalContent: string, feedback: string, defaultPrompt?: string, imageUrls?: string[]) {
  const defaultSection = defaultPrompt?.trim()
    ? `【最優先指示】管理者から以下の指示が常時設定されています。書き直しの際もこの指示を踏まえてください。\n${defaultPrompt.trim()}\n\n---\n\n`
    : "";

  const imageNote = imageUrls && imageUrls.length > 0
    ? `\n\n管理者から参考画像が添付されています。画像の内容（画面の様子、キャンペーン情報、誤字、レイアウトなど）を踏まえてフィードバックに対応してください。
フィードバックでこの画像を本文に挿入するよう指示されている場合は、内容に合った見出しの直後など適切な位置に ![説明](URL) の形式で挿入してください。画像は縦長の場合もあるため、無理に複数並べたりせず、文脈に合わせて1箇所に自然に配置してください。
添付画像のURL（上から順）:
${imageUrls.map((url) => `- ${url}`).join("\n")}`
    : "";

  return `${defaultSection}以下の記事を管理者のフィードバックに基づいて書き直してください。

【フィードバック】
${feedback}${imageNote}

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

// 招待コードカード用キャッチコピーの共通ルール（記事生成時・既存サービスの一括生成時の両方で使用）
const CATCH_COPY_RULES = `【キャッチコピーのルール】
- 2行のテキストのみを出力すること（前置き・説明・記号は一切不要）
- 各行15字以内（厳守）。文字数を数えてから出力し、15字を超える場合や、文の途中で切れて不完全・不自然になる場合は、15字以内で意味が通る完結した文になるよう書き直してから出力すること
- ポイント数・金額・キャンペーン名などの数字情報は含めないこと（数字情報は別の場所に表示されるため）
- サービスの特徴・強み・メリットを端的に伝える訴求文にすること
- 絵文字や記号は使わないこと`;

// 招待コード記事生成プロンプトの末尾に付与する指示。招待コードカード用の2行キャッチコピーをSEO meta descriptionに続けて生成させる
const CATCH_COPY_SUFFIX_INSTRUCTION = `

【招待コードカード用キャッチコピー（必須）】
SEO meta descriptionの出力後、必ず区切り行 "---CATCH_COPY---" を出力し、その次の2行に、招待コード一覧ページのカードに表示するキャッチコピーを出力してください（この出力は省略しないこと）。
${CATCH_COPY_RULES}`;

const CATCH_COPY_DELIMITER = /\n*---CATCH_COPY---\n*/;

// SEO meta descriptionの出力を、description本体と招待コードカード用キャッチコピーに分割する。区切りが見つからない場合はcatchCopyをnullで返す
export function splitDescriptionAndCatchCopy(raw: string): { description: string; catchCopy: string | null } {
  const parts = raw.split(CATCH_COPY_DELIMITER);
  if (parts.length < 2) return { description: raw.trim(), catchCopy: null };
  const catchCopy = parts.slice(1).join("").trim().split("\n").map((l) => l.trim().slice(0, 15)).filter(Boolean).slice(0, 2).join("\n");
  return { description: parts[0].trim(), catchCopy: catchCopy || null };
}

// AIがCATCH_COPYを出力しなかった場合のフォールバック。meta descriptionの文章から先頭2文を2行のキャッチコピーとして抜き出す
export function deriveCatchCopyFromDescription(description: string, serviceName: string): string {
  const text = description.replace(/\s+/g, "");
  const segments = text.split(/[。！？]/).filter(Boolean);
  const line1 = (segments[0] ?? serviceName).slice(0, 15);
  const line2 = (segments[1] ?? `${serviceName}は今がお得！`).slice(0, 15);
  return `${line1}\n${line2}`;
}
