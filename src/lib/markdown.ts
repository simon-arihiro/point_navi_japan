import { marked, Parser, type Token } from "marked";

// 見出し(h2/h3)にアンカー用のidを振るためのカウンター。renderMarkdown呼び出しごとにリセットする
let headingCounter = 0;

// AI生成記事はMarkdown本文をそのまま保存しているため、表示時にHTMLへ変換する。
// 本文中に生のHTMLタグが含まれていても出力しない（XSS対策）。
marked.use({
  renderer: {
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      if (token.depth === 2 || token.depth === 3) {
        const id = `section-${headingCounter++}`;
        return `<h${token.depth} id="${id}" class="scroll-mt-[100px] md:scroll-mt-[120px]">${text}</h${token.depth}>\n`;
      }
      return `<h${token.depth}>${text}</h${token.depth}>\n`;
    },
    html() {
      return "";
    },
  },
  extensions: [
    // ==text== 記法を赤字太字の強調表示に変換する（招待コード記事でサービス名・招待コードを強調するため）
    {
      name: "highlight",
      level: "inline",
      start(src: string) {
        return src.indexOf("==");
      },
      tokenizer(src: string) {
        const match = /^==([^=\n]+)==/.exec(src);
        if (!match) return undefined;
        return {
          type: "highlight",
          raw: match[0],
          text: match[1].trim(),
          tokens: this.lexer.inlineTokens(match[1].trim()),
        };
      },
      renderer(token) {
        return `<span class="text-red-600 font-bold">${this.parser.parseInline(token.tokens ?? [])}</span>`;
      },
    },
  ],
});

export function renderMarkdown(content: string): string {
  headingCounter = 0;
  return marked.parse(content ?? "", { async: false }) as string;
}

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

// 記事本文（Markdown）からh2/h3見出しを抽出し、renderMarkdownで振られるidと同じ規則でidを付与する
export function extractHeadings(content: string): TocItem[] {
  const tokens = marked.lexer(content ?? "");
  const headings: TocItem[] = [];
  let counter = 0;
  for (const token of tokens) {
    if (token.type === "heading" && (token.depth === 2 || token.depth === 3)) {
      const html = Parser.parseInline(token.tokens ?? []) as string;
      const text = html.replace(/<[^>]+>/g, "").trim();
      headings.push({
        id: `section-${counter++}`,
        text,
        depth: token.depth,
      });
    }
  }
  return headings;
}

// AIが ![alt]\n(url) のように alt と url の間で改行してしまい画像として認識されなくなるケースの救済。
// 「![alt]」の直後（間に短い余計な1行が挟まる場合も含む）に続く「(url)」を1行の画像記法に結合する
export function repairBrokenImageMarkdown(content: string): string {
  if (!content) return content;
  return content.replace(
    /!\[([^\]]*)\]\s*\n+(?:[^\n(]{0,30}\n+)?\((https?:\/\/[^\s)]+)\)/g,
    (_match, alt, url) => `![${alt}](${url})`
  );
}

export type FaqPair = { question: string; answer: string };

// FAQ記事のMarkdown本文から「## Q1. ...」形式の見出しとその直後の本文をQ&Aペアとして抽出する（FAQPage構造化データ用）
export function extractFaqPairs(content: string): FaqPair[] {
  const tokens = marked.lexer(content ?? "");
  const pairs: FaqPair[] = [];
  let current: { question: string; bodyTokens: Token[] } | null = null;

  const flush = () => {
    if (!current) return;
    const html = Parser.parse(current.bodyTokens);
    const answer = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (answer) pairs.push({ question: current.question, answer });
    current = null;
  };

  for (const token of tokens) {
    if (token.type === "heading" && /^Q\d*[.．]/.test(Parser.parseInline(token.tokens ?? []).replace(/<[^>]+>/g, "").trim())) {
      flush();
      const text = Parser.parseInline(token.tokens ?? []).replace(/<[^>]+>/g, "").trim();
      current = { question: text, bodyTokens: [] };
    } else if (token.type === "heading") {
      flush();
    } else if (current) {
      current.bodyTokens.push(token);
    }
  }
  flush();

  return pairs;
}

// 記事本文（Markdown）内で最初に登場する画像のURLを抽出する（カード等のサムネイル表示用）
export function extractFirstImageUrl(content: string): string | null {
  const match = content?.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

// 本文先頭の画像（既存のアイキャッチ等）にマッチする正規表現
const LEADING_IMAGE_RE = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*\n+/;

// 生成・アップロードした画像を必ず本文の最前面に配置する（記事のサムネイルは本文内の最初の画像を使用するため）。
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

// 記事本文（Markdown→HTML）の見た目を統一するためのprose設定。
// サイトの琥珀×ネイビー基調に合わせて見出し・リンク・引用の色を調整している。
export const ARTICLE_PROSE_CLASS =
  "prose prose-sm sm:prose-base max-w-none prose-slate " +
  "prose-headings:font-black prose-headings:text-slate-900 " +
  "prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-slate-900 prose-blockquote:border-brand-300 " +
  // 縦長画像が記事内で過剰に大きく表示されないよう、高さに上限を設けて中央寄せにする
  "prose-img:rounded-xl prose-img:mx-auto prose-img:w-auto prose-img:max-w-full prose-img:max-h-[32rem]";
