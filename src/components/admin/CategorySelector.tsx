"use client";

import { useEffect, useRef, useState } from "react";
import { Category } from "@/lib/categories";

type Props = {
  allCategories: Category[];
  selected: string[];
  onToggle: (name: string) => void;
};

export default function CategorySelector({ allCategories, selected, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 既存カテゴリ + AI補完などで追加された未登録カテゴリ名を統合表示
  const names = [...allCategories.map((c) => c.name)];
  for (const name of selected) {
    if (!names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
  }

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
      <p className="text-xs text-gray-400 mb-2">
        該当するものを選択してください（複数可）。未選択の場合はAI補完で自動選択されます。
      </p>

      {names.length === 0 ? (
        <p className="text-xs text-gray-400">カテゴリがまだ登録されていません</p>
      ) : (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span className={selected.length > 0 ? "text-gray-900" : "text-gray-400"}>
              {selected.length > 0 ? `${selected.length}件選択中` : "カテゴリを選択"}
            </span>
            <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
          </button>

          {open && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-2">
              {names.map((name) => {
                const isSelected = selected.some((s) => s.toLowerCase() === name.toLowerCase());
                return (
                  <label
                    key={name}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(name)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          )}

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selected.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => onToggle(name)}
                    aria-label={`${name} を選択解除`}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
