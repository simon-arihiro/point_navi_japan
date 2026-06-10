"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export default function MultiSelectFilter({ label, options, selected, onChange, placeholder = "すべて" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <span className={selected.length > 0 ? "text-gray-900" : "text-gray-400"}>
          {selected.length > 0 ? `${selected.length}件選択中` : placeholder}
        </span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-2">
          {options.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-2">選択肢がありません</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
