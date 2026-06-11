// AI記事生成のプロンプトに含まれるURLを抽出し、ページ本文をテキストとして取得するユーティリティ

const URL_REGEX = /https?:\/\/[^\s<>"'）)\]]+/g;
const MAX_URLS = 3;
const MAX_CONTENT_LENGTH = 3000;
const FETCH_TIMEOUT_MS = 8000;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return Array.from(new Set(matches)).slice(0, MAX_URLS);
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]*\n+/g, "\n")
    .trim();
}

export type WebContent = { url: string; content: string | null };

async function fetchWebContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PointNaviBot/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;
    const html = await res.text();
    const text = htmlToText(html).slice(0, MAX_CONTENT_LENGTH);
    return text || null;
  } catch {
    return null;
  }
}

export async function fetchWebContents(urls: string[]): Promise<WebContent[]> {
  return Promise.all(urls.map(async (url) => ({ url, content: await fetchWebContent(url) })));
}
