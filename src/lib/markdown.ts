import { marked } from "marked";

// AI生成記事はMarkdown本文をそのまま保存しているため、表示時にHTMLへ変換する。
// 本文中に生のHTMLタグが含まれていても出力しない（XSS対策）。
marked.use({
  renderer: {
    html() {
      return "";
    },
  },
});

export function renderMarkdown(content: string): string {
  return marked.parse(content ?? "", { async: false }) as string;
}

// 記事本文（Markdown→HTML）の見た目を統一するためのprose設定。
// サイトの琥珀×ネイビー基調に合わせて見出し・リンク・引用の色を調整している。
export const ARTICLE_PROSE_CLASS =
  "prose prose-sm sm:prose-base max-w-none prose-slate " +
  "prose-headings:font-black prose-headings:text-slate-900 " +
  "prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-slate-900 prose-blockquote:border-amber-300 prose-img:rounded-xl";
