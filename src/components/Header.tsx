"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/types/database";
import Mascot from "@/components/Mascot";

type Props = {
  categories?: Category[];
};

export default function Header({ categories = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Mascot className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">
              ポイ<span className="text-amber-600">ナビ</span>
            </span>
          </Link>

          {/* PC Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-slate-900 font-medium transition-colors text-sm">
              ホーム
            </Link>

            {/* サービス一覧 + ドロップダウン */}
            <div ref={dropRef} className="relative">
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-slate-900 font-medium transition-colors text-sm"
                onMouseEnter={() => setDropOpen(true)}
                onClick={() => setDropOpen((v) => !v)}
              >
                サービス一覧
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  onMouseLeave={() => setDropOpen(false)}
                >
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-slate-900"
                    onClick={() => setDropOpen(false)}
                  >
                    すべて表示
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/services/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-slate-900"
                      onClick={() => setDropOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/ranking" className="text-gray-600 hover:text-slate-900 font-medium transition-colors text-sm">
              ランキング
            </Link>
            <Link href="/articles" className="text-gray-600 hover:text-slate-900 font-medium transition-colors text-sm">
              記事
            </Link>
          </nav>

          {/* PC 検索 */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-500 hover:text-slate-900 transition-colors"
              aria-label="検索"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>

          {/* スマホ: ロゴ(左)＋検索＋ハンバーガー(右) */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/search" className="p-2 text-gray-500" aria-label="検索">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button
              className="p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="メニュー"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* スマホメニュー */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
            <Link href="/" className="block px-2 py-2 text-gray-700 hover:text-slate-900 text-sm" onClick={() => setMenuOpen(false)}>ホーム</Link>
            <Link href="/services" className="block px-2 py-2 text-gray-700 hover:text-slate-900 text-sm" onClick={() => setMenuOpen(false)}>サービス一覧</Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/services/${cat.slug}`} className="block px-6 py-1.5 text-gray-500 hover:text-slate-900 text-xs" onClick={() => setMenuOpen(false)}>
                └ {cat.name}
              </Link>
            ))}
            <Link href="/ranking" className="block px-2 py-2 text-gray-700 hover:text-slate-900 text-sm" onClick={() => setMenuOpen(false)}>ランキング</Link>
            <Link href="/articles" className="block px-2 py-2 text-gray-700 hover:text-slate-900 text-sm" onClick={() => setMenuOpen(false)}>記事</Link>
          </div>
        )}
      </div>
    </header>
  );
}
