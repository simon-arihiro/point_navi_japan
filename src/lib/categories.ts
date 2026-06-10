export type Category = { id: string; name: string; slug: string };

// カテゴリ名のリストから category_id のリストへ解決する。
// 既存カテゴリは名前一致（大文字小文字無視）させ、未存在のものは新規作成する。
export async function resolveCategoryIds(
  names: string[],
  allCategories: Category[],
  onNewCategory: (category: Category) => void
): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const existing = allCategories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { data: newCategory } = await res.json();
      ids.push(newCategory.id);
      onNewCategory(newCategory);
    }
  }
  return ids;
}
