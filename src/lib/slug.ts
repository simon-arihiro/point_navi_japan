// F.1 Slug 自動生成規則の共通実装
export function toSlug(name: string, prefix = "item"): string {
  const base = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return base || `${prefix}-${Date.now()}`;
}

// サービス記事のslugを意味のある形（`${service}-${type}`）で発行する。
// 同サービス・同タイプの記事が既に存在する場合のみ `-2`, `-3`... を付与する（タイムスタンプは使わない）
export async function generateUniqueArticleSlug(
  supabase: { from: (table: string) => any },
  base: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("articles")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((row: { slug: string }) => row.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
