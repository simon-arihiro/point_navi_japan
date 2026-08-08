"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/analytics", label: "アクセス分析" },
  { href: "/admin/seo", label: "SEO分析" },
  { href: "/admin/services", label: "サービス" },
  { href: "/admin/articles", label: "記事" },
  { href: "/admin/categories", label: "カテゴリ" },
  { href: "/admin/board", label: "掲示板管理" },
  { href: "/admin/contact", label: "お問い合わせ" },
  { href: "/admin/trash", label: "ゴミ箱" },
  { href: "/admin/settings", label: "設定" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-56 bg-gray-900 text-gray-300 flex flex-col z-30 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="font-bold text-white text-sm"
          >
            ポイナビ <span className="text-red-400">Admin</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-400 hover:text-white text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-800">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ← サイトを見る
          </Link>
        </div>
      </aside>

      {/* Main area (offset on desktop to clear fixed sidebar) */}
      <div className="md:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-10 bg-gray-900 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-300 hover:text-white"
            aria-label="メニューを開く"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="19" y2="6" />
              <line x1="3" y1="11" x2="19" y2="11" />
              <line x1="3" y1="16" x2="19" y2="16" />
            </svg>
          </button>
          <Link href="/admin" className="font-bold text-white text-sm">
            ポイナビ <span className="text-red-400">Admin</span>
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
