"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoFallback from "@/components/LogoFallback";

type Service = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  official_url?: string | null;
  submission_count: number;
};

type Props = { services: Service[] };

export default function BoardLeftNav({ services }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavList = () => (
    <ul className="space-y-0.5">
      <li>
        <Link
          href="/codes"
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/codes"
              ? "bg-brand-50 text-brand-700 font-bold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => setOpen(false)}
        >
          <span>📋 すべて表示</span>
        </Link>
      </li>
      {services.map((s) => (
        <li key={s.id}>
          <Link
            href={`/codes/${s.slug}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === `/codes/${s.slug}`
                ? "bg-brand-50 text-brand-700 font-bold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setOpen(false)}
          >
            <LogoFallback
              name={s.name}
              logoUrl={s.logo_url}
              logoStoragePath={s.logo_storage_path}
              officialUrl={s.official_url ?? undefined}
              size={20}
              className="shrink-0"
            />
            <span className="flex-1 truncate">{s.name}</span>
            {s.submission_count > 0 && (
              <span className="text-xs text-gray-400 shrink-0">💬{s.submission_count}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* デスクトップ */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24">
          <div className="bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-t-xl">
            サービスメニュー
          </div>
          <div className="py-2 px-1 max-h-[70vh] overflow-y-auto">
            <NavList />
          </div>
        </div>
      </aside>

      {/* モバイル: アコーディオン */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
        >
          <span>サービスメニュー</span>
          <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="bg-white border border-gray-100 rounded-b-xl shadow-sm px-1 py-2">
            <NavList />
          </div>
        )}
      </div>
    </>
  );
}
