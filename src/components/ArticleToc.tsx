import type { TocItem } from "@/lib/markdown";

type Props = {
  items: TocItem[];
  className?: string;
};

// 記事の目次。見出しへのアンカーリンクを一覧表示する（本文上部・サイドバー共通で使用）
// h2には「1.」「2.」、その下のh3には「1-1.」「1-2.」のように階層番号を振り、
// h3はインデント・やや小さいフォントで表示する
export default function ArticleToc({ items, className }: Props) {
  if (items.length === 0) return null;

  let h2Index = 0;
  let h3Index = 0;
  const numbered = items.map((item) => {
    if (item.depth === 2) {
      h2Index += 1;
      h3Index = 0;
      return { ...item, number: `${h2Index}` };
    }
    h3Index += 1;
    return { ...item, number: `${h2Index}-${h3Index}` };
  });

  return (
    <nav aria-label="目次">
      <ul className={`space-y-2 ${className ?? "text-sm"}`}>
        {numbered.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "ml-5 text-[0.85em]" : ""}>
            <a href={`#${item.id}`} className="text-brand-700 hover:underline">
              {item.number}. {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
