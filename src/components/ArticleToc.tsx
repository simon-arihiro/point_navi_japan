import type { TocItem } from "@/lib/markdown";

type Props = {
  items: TocItem[];
  className?: string;
};

// 記事の目次。見出しへのアンカーリンクを一覧表示する（本文上部・サイドバー共通で使用）
export default function ArticleToc({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className={className} aria-label="目次">
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "ml-4" : ""}>
            <a href={`#${item.id}`} className="text-brand-700 hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
