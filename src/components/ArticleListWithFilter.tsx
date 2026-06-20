"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleWithService } from "@/types/database";

type Filter = "all" | "invitation" | "other";

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "invitation", label: "招待コード" },
  { key: "other", label: "体験レビュー・攻略" },
];

function matchesFilter(articleType: string, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "invitation") return articleType === "invitation";
  return articleType !== "invitation";
}

export default function ArticleListWithFilter({ articles }: { articles: ArticleWithService[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = articles.filter((a) => matchesFilter(a.article_type, filter));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tab) => {
          const count = articles.filter((a) => matchesFilter(a.article_type, tab.key)).length;
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`text-sm font-bold px-4 py-2 rounded-full border-2 transition-colors ${
                active
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-brand-300"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${active ? "text-brand-100" : "text-gray-400"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/library/squirrel-empty-square.png" alt="" className="w-32 sm:w-40 h-auto mx-auto mb-4 opacity-90" />
          <p>記事はまだありません</p>
        </div>
      )}
    </div>
  );
}
