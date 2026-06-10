"use client";

import { Category } from "@/lib/categories";

type Props = {
  allCategories: Category[];
  selected: string[];
  onToggle: (name: string) => void;
};

export default function CategorySelector({ allCategories, selected, onToggle }: Props) {
  // 既存カテゴリ + AI補完などで追加された未登録カテゴリ名を統合表示
  const names = [...allCategories.map((c) => c.name)];
  for (const name of selected) {
    if (!names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
      <p className="text-xs text-gray-400 mb-2">
        該当するものを選択してください（複数可）。未選択の場合はAI補完で自動選択されます。
      </p>
      {names.length === 0 ? (
        <p className="text-xs text-gray-400">カテゴリがまだ登録されていません</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {names.map((name) => {
            const isSelected = selected.some((s) => s.toLowerCase() === name.toLowerCase());
            return (
              <button
                key={name}
                type="button"
                onClick={() => onToggle(name)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  isSelected
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
