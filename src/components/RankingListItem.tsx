import Link from "next/link";
import { ServiceWithRelations } from "@/types/database";
import LogoFallback from "./LogoFallback";
import { getCampaignBadge } from "@/lib/campaign";

type Props = {
  service: ServiceWithRelations;
  categorySlug?: string;
  rank: number;
};

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// サイドバー用のコンパクトなランキング行
export default function RankingListItem({ service, categorySlug, rank }: Props) {
  const cat = categorySlug ?? "all";
  const href = `/services/${cat}/${service.slug}`;
  const badge = getCampaignBadge(service);

  return (
    <Link href={href} className="group flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-xl hover:bg-amber-50/60 transition-colors">
      <span className="text-base font-black w-6 text-center shrink-0 text-gray-300 group-hover:text-amber-500 transition-colors">
        {RANK_MEDAL[rank] ?? `#${rank}`}
      </span>
      <LogoFallback
        name={service.name}
        logoUrl={service.logo_url}
        logoStoragePath={service.logo_storage_path}
        officialUrl={service.official_url}
        size={36}
      />
      <p className="min-w-0 flex-1 font-bold text-sm text-gray-900 truncate group-hover:text-amber-700 transition-colors">
        {service.name}
      </p>
      {badge && (
        <span className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 ${badge.urgent ? "bg-orange-500 text-white" : "bg-amber-100 text-amber-800"}`}>
          {badge.label}
        </span>
      )}
    </Link>
  );
}
