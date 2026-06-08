"use client";

import { useState } from "react";
import { programs, categories } from "@/data/programs";
import ProgramCard from "@/components/ProgramCard";

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = programs.filter((p) => {
    const matchesCategory =
      selectedCategory === "すべて" || p.categories.includes(selectedCategory);
    const matchesSearch =
      searchQuery === "" ||
      p.name.includes(searchQuery) ||
      p.company.includes(searchQuery) ||
      p.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">ポイントプログラム一覧</h1>
          <p className="text-gray-600">日本の主要ポイントプログラムを比較・検索できます</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="ポイント名・会社名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length}件のポイントプログラム
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>該当するポイントプログラムが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
