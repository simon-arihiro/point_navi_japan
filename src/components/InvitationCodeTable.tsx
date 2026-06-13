"use client";

import { useState } from "react";
import Link from "next/link";
import LogoFallback from "./LogoFallback";

type Row = {
  id: string;
  name: string;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
  officialUrl?: string | null;
  referralCode?: string | null;
  href: string;
};

const DEFAULT_VISIBLE = 8;

// 招待コード一覧ページ上部に表示する「サービス名＋招待コード」の簡易一覧表。多数のサービスから目的のサービスを見つけやすくする
export default function InvitationCodeTable({ rows }: { rows: Row[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, DEFAULT_VISIBLE);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="divide-y divide-gray-50">
        {visible.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50/40 transition-colors"
          >
            <LogoFallback
              name={row.name}
              logoUrl={row.logoUrl ?? undefined}
              logoStoragePath={row.logoStoragePath ?? undefined}
              officialUrl={row.officialUrl ?? undefined}
              size={28}
              className="shrink-0"
            />
            <span className="font-bold text-gray-900 text-sm truncate min-w-0 flex-1">{row.name}</span>
            {row.referralCode ? (
              <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 bg-gray-50 rounded-lg px-2.5 py-1 tracking-wider shrink-0">
                {row.referralCode}
              </span>
            ) : (
              <span className="text-xs text-gray-400 shrink-0">招待リンクのみ</span>
            )}
          </Link>
        ))}
      </div>
      {rows.length > DEFAULT_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="block w-full text-center text-sm font-bold text-brand-700 hover:bg-brand-50 py-2.5 border-t border-gray-50 transition-colors"
        >
          {expanded ? "閉じる ▲" : `すべて見る（${rows.length}件） ▼`}
        </button>
      )}
    </div>
  );
}
