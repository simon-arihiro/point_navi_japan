// AIの応答に前置き・コードブロック等が混在していてもJSON部分のみを抽出してパースする
export function extractJson<T = unknown>(text: string): T | null {
  const cleaned = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
