import { marked } from "marked";

// AI生成記事はMarkdown本文をそのまま保存しているため、表示時にHTMLへ変換する。
// 本文中に生のHTMLタグが含まれていても出力しない（XSS対策）。
marked.use({
  renderer: {
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
  return marked.parse(content ?? "", { async: false }) as string;
}

// 記事本文（Markdown）内で最初に登場する画像のURLを抽出する（カード等のサムネイル表示用）
export function extractFirstImageUrl(content: string): string | null {
  const match = content?.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

// 記事本文（Markdown→HTML）の見た目を統一するためのprose設定。
// サイトの琥珀×ネイビー基調に合わせて見出し・リンク・引用の色を調整している。
export const ARTICLE_PROSE_CLASS =
  "prose prose-sm sm:prose-base max-w-none prose-slate " +
  "prose-headings:font-black prose-headings:text-slate-900 " +
  "prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-slate-900 prose-blockquote:border-brand-300 prose-img:rounded-xl";
