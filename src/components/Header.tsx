"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/types/database";
import Mascot from "@/components/Mascot";
import SearchBox from "@/components/SearchBox";

type Props = {
  categories?: Category[];
};

export default function Header({ categories = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const navLinkClass = (href: string) =>
    `font-medium transition-colors text-sm ${isActive(href) ? "text-amber-700 font-bold" : "text-gray-600 hover:text-slate-900"}`;

  const mobileNavLinkClass = (href: string) =>
    `block px-2 py-2 text-sm transition-colors ${isActive(href) ? "text-amber-700 font-bold" : "text-gray-700 hover:text-slate-900"}`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ページ遷移時に開いていた検索パネル・モバイルメニューを閉じる
  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Mascot className="w-12 h-12" />
            <span className="text-3xl font-black text-gray-900">
              ポイ<span className="text-amber-600">ナビ</span>
            </span>
          </Link>

          {/* PC Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={navLinkClass("/")}>
              ホーム
            </Link>

            {/* サービス一覧 + ドロップダウン */}
            <div ref={dropRef} className="relative">
              <Link
                href="/services"
                className={`flex items-center gap-1 ${navLinkClass("/services")}`}
                onMouseEnter={() => setDropOpen(true)}
              >
                サービス一覧
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
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
                      className={`block px-4 py-2 text-sm hover:bg-amber-50 hover:text-slate-900 ${pathname === `/services/${cat.slug}` ? "text-amber-700 font-bold" : "text-gray-700"}`}
                      onClick={() => setDropOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/ranking" className={navLinkClass("/ranking")}>
              ランキング
            </Link>
            <Link href="/articles" className={navLinkClass("/articles")}>
              記事
            </Link>
          </nav>

          {/* PC 検索 */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              className={`p-2 rounded-full transition-colors ${searchOpen ? "text-amber-700 bg-amber-50" : "text-gray-500 hover:text-slate-900"}`}
              aria-label="検索"
              aria-expanded={searchOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* スマホ: ロゴ(左)＋検索＋ハンバーガー(右) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              className={`p-2 rounded-full transition-colors ${searchOpen ? "text-amber-700 bg-amber-50" : "text-gray-500"}`}
              aria-label="検索"
              aria-expanded={searchOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              className="p-2 text-gray-600"
              onClick={() => {
                setMenuOpen((v) => !v);
                setSearchOpen(false);
              }}
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

        {/* 検索パネル */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-4">
            <div className="w-full md:max-w-md md:ml-auto">
              <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </div>
        )}

        {/* スマホメニュー */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
            <Link href="/" className={mobileNavLinkClass("/")} onClick={() => setMenuOpen(false)}>ホーム</Link>
            <Link href="/services" className={mobileNavLinkClass("/services")} onClick={() => setMenuOpen(false)}>サービス一覧</Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services/${cat.slug}`}
                className={`block px-6 py-1.5 text-xs transition-colors ${pathname === `/services/${cat.slug}` ? "text-amber-700 font-bold" : "text-gray-500 hover:text-slate-900"}`}
                onClick={() => setMenuOpen(false)}
              >
                └ {cat.name}
              </Link>
            ))}
            <Link href="/ranking" className={mobileNavLinkClass("/ranking")} onClick={() => setMenuOpen(false)}>ランキング</Link>
            <Link href="/articles" className={mobileNavLinkClass("/articles")} onClick={() => setMenuOpen(false)}>記事</Link>
          </div>
        )}
      </div>
    </header>
  );
}
