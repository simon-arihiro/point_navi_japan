// F.1 Slug 自動生成規則の共通実装
export function toSlug(name: string, prefix = "item"): string {
  const base = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return base || `${prefix}-${Date.now()}`;
}
