import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "管理画面", template: "%s | 管理画面" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/admin" className="font-bold text-white text-sm">
            ポイ活ナビ <span className="text-red-400">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 space-y-1 text-sm">
          {[
            { href: "/admin", label: "ダッシュボード" },
            { href: "/admin/services", label: "サービス管理" },
            { href: "/admin/articles", label: "記事管理" },
            { href: "/admin/categories", label: "カテゴリ" },
            { href: "/admin/tags", label: "タグ" },
            { href: "/admin/settings", label: "設定" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-800">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">← サイトを見る</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
}
