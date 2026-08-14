import Link from "next/link";
import LogoFallback from "./LogoFallback";

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  logo_storage_path?: string | null;
  bonus_amount?: number | null;
  bonus_points?: number | null;
  categories?: { category?: { slug: string; name: string } | null }[];
};

type Props = {
  services: ServiceItem[];
  title?: string;
};

export default function RelatedServices({ services, title = "他のおすすめポイ活" }: Props) {
  if (!services || services.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">🎯 {title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => {
          const categorySlug = s.categories?.[0]?.category?.slug ?? "all";
          const bonus = s.bonus_amount
            ? `約${s.bonus_amount}円分`
            : s.bonus_points
            ? `${Number(s.bonus_points).toLocaleString()}pt`
            : null;
          return (
            <Link
              key={s.id}
              href={`/services/${categorySlug}/${s.slug}`}
              className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <LogoFallback
                name={s.name}
                logoUrl={s.logo_url ?? null}
                logoStoragePath={s.logo_storage_path ?? null}
                officialUrl={undefined}
                size={44}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-brand-700 transition-colors leading-tight">{s.name}</p>
                {bonus && (
                  <p className="text-xs text-amber-600 font-bold mt-0.5">🎁 新規登録で{bonus}もらえる</p>
                )}
                {s.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{s.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
