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

const DEFAULT_VISIBLE = 25;

// 招待コード一覧ページ上部に表示する「サービス名＋招待コード」の簡易一覧表。多数のサービスから目的のサービスを見つけやすくする
export default function InvitationCodeTable({ rows }: { rows: Row[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, DEFAULT_VISIBLE);

  if (rows.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {visible.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-brand-200 hover:shadow-sm transition-all min-w-0"
          >
            <LogoFallback
              name={row.name}
              logoUrl={row.logoUrl ?? undefined}
              logoStoragePath={row.logoStoragePath ?? undefined}
              officialUrl={row.officialUrl ?? undefined}
              size={24}
              className="shrink-0"
            />
            <span className="font-bold text-gray-900 text-xs truncate min-w-0 flex-1">{row.name}</span>
            {row.referralCode ? (
              <span className="font-mono text-[11px] font-bold text-gray-900 bg-gray-50 rounded px-1.5 py-0.5 tracking-wider shrink-0">
                {row.referralCode}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 shrink-0">リンクのみ</span>
            )}
          </Link>
        ))}
      </div>
      {rows.length > DEFAULT_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="block w-full text-center text-sm font-bold text-brand-700 hover:bg-brand-50 py-2.5 mt-2 rounded-xl border border-gray-100 bg-white transition-colors"
        >
          {expanded ? "閉じる ▲" : `すべて見る（${rows.length}件） ▼`}
        </button>
      )}
    </div>
  );
}
