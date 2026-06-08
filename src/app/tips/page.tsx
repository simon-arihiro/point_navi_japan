"use client";

import { useState } from "react";
import { articles, articleCategories } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const filtered =
    selectedCategory === "すべて"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const featured = articles.filter((a) => a.featured);

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">ポイ活お得情報</h1>
          <p className="text-gray-600">ポイントを賢く貯めて使うための攻略記事集</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured */}
        {selectedCategory === "すべて" && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-gray-900 mb-4">注目記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {articleCategories.map((cat) => (
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

        <p className="text-sm text-gray-500 mb-6">{filtered.length}件の記事</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
