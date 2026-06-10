export type Category = { id: string; name: string; slug: string };

// カテゴリ名のリストから category_id のリストへ解決する。
// 既存カテゴリと名前一致（大文字小文字無視）するもののみを対象とし、
// 未登録のカテゴリ名は無視する（カテゴリの新規作成は管理画面からのみ行う）。
export function resolveCategoryIds(names: string[], allCategories: Category[]): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const existing = allCategories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) ids.push(existing.id);
  }
  return ids;
}
