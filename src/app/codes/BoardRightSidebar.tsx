"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type RecentPost = {
  id: string;
  service_id: string;
  nickname: string;
  referral_code: string;
  created_at: string;
  service: { name: string; slug: string } | null;
};

type RankingService = {
  id: string;
  name: string;
  slug: string;
  submission_count: number;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return d.toLocaleDateString("ja-JP");
}

type Props = {
  recent: RecentPost[];
  ranking: RankingService[];
  searchOnly?: boolean;
};

export default function BoardRightSidebar({ recent, ranking, searchOnly }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/codes?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const SearchBox = () => (
    <form onSubmit={handleSearch} className="flex gap-0">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="サービス名を検索"
        className="flex-1 border border-gray-200 rounded-l-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 rounded-r-xl hover:bg-blue-700 transition-colors shrink-0 flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );

  if (searchOnly) {
    return <SearchBox />;
  }

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-4">
      {/* 検索 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5">検索</div>
        <div className="p-3">
          <SearchBox />
        </div>
      </div>

      {/* 最近の更新 */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5">最近の更新</div>
          <ul className="divide-y divide-gray-50">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/codes/${p.service?.slug ?? ""}`}
                  className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-brand-700 truncate">{p.service?.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{formatDate(p.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ランキング */}
      {ranking.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5">投稿数ランキング</div>
          <ul className="divide-y divide-gray-50">
            {ranking.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/codes/${s.slug}`}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-sm font-black w-5 text-center ${
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{s.name}</span>
                  <span className="text-xs text-gray-400">💬{s.submission_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
