import Link from "next/link";
import { ServiceWithRelations } from "@/types/database";
import LogoFallback from "./LogoFallback";
import { getCampaignBadge } from "@/lib/campaign";

type Props = {
  service: ServiceWithRelations;
  categorySlug?: string;
  rank?: number;
};

export default function ServiceCard({ service, categorySlug, rank }: Props) {
  const cat = categorySlug ?? service.categories?.[0]?.slug ?? "all";
  const href = `/services/${cat}/${service.slug}`;
  const badge = getCampaignBadge(service);

  return (
    <Link href={href} className="group block">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all h-full">
        {badge && (
          <span
            className={`absolute top-3 right-3 text-xs font-bold rounded-full px-2.5 py-1 ${
              badge.urgent ? "bg-brand-warm-500 text-white" : "bg-brand-100 text-brand-800"
            }`}
          >
            🔥 期間限定 {badge.label}
          </span>
        )}
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
            <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
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
      </div>
    </Link>
  );
}
