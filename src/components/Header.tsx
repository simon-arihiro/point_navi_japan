"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              ポイントナビ
              <span className="text-red-600">Japan</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/programs" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              ポイント一覧
            </Link>
            <Link href="/compare" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              比較ツール
            </Link>
            <Link href="/tips" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              お得情報
            </Link>
            <Link href="/ranking" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
              ランキング
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-red-600"
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

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/programs" className="block px-2 py-2 text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>
              ポイント一覧
            </Link>
            <Link href="/compare" className="block px-2 py-2 text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>
              比較ツール
            </Link>
            <Link href="/tips" className="block px-2 py-2 text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>
              お得情報
            </Link>
            <Link href="/ranking" className="block px-2 py-2 text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>
              ランキング
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
