import Link from "next/link";
import { Category } from "@/types/database";
import SearchBox from "@/components/SearchBox";

export function SearchCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="font-black text-gray-900 text-sm mb-3">検索</h2>
      <SearchBox />
    </div>
  );
}

type CategoryCardProps = {
  categories: Category[];
};

export function CategoryCard({ categories }: CategoryCardProps) {
  if (categories.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="font-black text-gray-900 text-sm mb-3">カテゴリー</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/services/${c.slug}`}
            className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1.5 hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

type Props = {
  categories: Category[];
};

export default function Sidebar({ categories }: Props) {
  return (
    <div className="space-y-6">
      <SearchCard />
      <CategoryCard categories={categories} />
    </div>
  );
}
