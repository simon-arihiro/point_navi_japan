import Link from "next/link";
import { ServiceWithRelations } from "@/types/database";
import LogoFallback from "./LogoFallback";

type Props = {
  service: ServiceWithRelations;
  categorySlug?: string;
  rank?: number;
};

export default function ServiceCard({ service, categorySlug, rank }: Props) {
  const cat = categorySlug ?? service.categories?.[0]?.slug ?? "all";
  const href = `/services/${cat}/${service.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all h-full">
        <div className="flex items-start gap-4">
          {rank !== undefined && (
            <span className="text-2xl font-black text-gray-200 w-8 shrink-0">#{rank}</span>
          )}
          <LogoFallback
            name={service.name}
            logoUrl={service.logo_url}
            logoStoragePath={service.logo_storage_path}
            officialUrl={service.official_url}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
              {service.name}
            </h3>
            {service.categories?.[0] && (
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 mt-1 inline-block">
                {service.categories[0].name}
              </span>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        )}

        <div className="mt-3 flex gap-2 flex-wrap">
          {service.referral_code && (
            <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">招待コードあり</span>
          )}
          {service.referral_link && (
            <span className="text-xs bg-orange-50 text-orange-700 rounded-full px-2 py-0.5">招待リンクあり</span>
          )}
        </div>
      </div>
    </Link>
  );
}
