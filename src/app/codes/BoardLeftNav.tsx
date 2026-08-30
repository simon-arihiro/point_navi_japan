"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoFallback from "@/components/LogoFallback";

type Category = { id: string; name: string; slug: string };

type Service = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  official_url?: string | null;
  submission_count: number;
  // Supabaseはリレーション結果を配列で返す
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories?: { category: Category | Category[] | null }[];
};

type Props = { services: Service[]; mobileOnly?: boolean };

// サービスをカテゴリごとにグループ化する
function groupByCategory(services: Service[]): { category: Category; services: Service[] }[] {
  const categoryMap = new Map<string, { category: Category; services: Service[] }>();
  const uncategorized: Service[] = [];

  for (const svc of services) {
    const rawCat = svc.categories?.[0]?.category;
    // Supabaseは単一リレーションも配列で返すことがある
    const cat = Array.isArray(rawCat) ? rawCat[0] : rawCat;
    if (!cat) {
      uncategorized.push(svc);
      continue;
    }
    if (!categoryMap.has(cat.id)) {
      categoryMap.set(cat.id, { category: cat, services: [] });
    }
    categoryMap.get(cat.id)!.services.push(svc);
  }

  const groups = Array.from(categoryMap.values()).sort((a, b) =>
    a.category.name.localeCompare(b.category.name, "ja")
  );

  if (uncategorized.length > 0) {
    groups.push({ category: { id: "__other", name: "その他", slug: "" }, services: uncategorized });
  }

  return groups;
}

function ServiceLink({ s, onClick }: { s: Service; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === `/codes/${s.slug}`;
  return (
    <Link
      href={`/codes/${s.slug}`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active ? "bg-brand-50 text-brand-700 font-bold" : "text-gray-700 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <LogoFallback
        name={s.name}
        logoUrl={s.logo_url}
        logoStoragePath={s.logo_storage_path}
        officialUrl={s.official_url ?? undefined}
        size={18}
        className="shrink-0"
      />
      <span className="flex-1 truncate">{s.name}</span>
      {s.submission_count > 0 && (
        <span className="text-xs text-gray-400 shrink-0">💬{s.submission_count}</span>
      )}
    </Link>
  );
}

function NavContent({ services, onClose }: { services: Service[]; onClose?: () => void }) {
  const pathname = usePathname();
  const groups = groupByCategory(services);

  return (
    <div className="space-y-4">
      {/* すべて表示 */}
      <Link
        href="/codes"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
          pathname === "/codes"
            ? "bg-brand-50 text-brand-700"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        onClick={onClose}
      >
        📋 すべて表示
      </Link>

      {/* カテゴリ別一覧 */}
      {groups.map((g) => (
        <div key={g.category.id}>
          {/* カテゴリ見出し */}
          <div className="px-3 py-1 text-xs font-bold text-white bg-gray-500 rounded-md mb-1">
            {g.category.name}
          </div>
          <ul className="space-y-0.5">
            {g.services.map((s) => (
              <li key={s.id}>
                <ServiceLink s={s} onClick={onClose} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function BoardLeftNav({ services, mobileOnly }: Props) {
  const [open, setOpen] = useState(false);

  if (mobileOnly) {
    return (
      <div className="mb-4">
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
          <div className="bg-white border border-gray-100 rounded-b-xl shadow-sm px-2 py-3">
            <NavContent services={services} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24">
        <div className="bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-t-xl">
          サービスメニュー
        </div>
        <div className="py-3 px-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <NavContent services={services} />
        </div>
      </div>
    </aside>
  );
}
