"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Granularity = "day" | "month";

const RANGE_OPTIONS: Record<Granularity, number[]> = {
  day: [30, 90],
  month: [6, 12],
};

export default function AnalyticsFilters({
  services,
  granularity,
  range,
  serviceId,
}: {
  services: { id: string; name: string }[];
  granularity: Granularity;
  range: number;
  serviceId: string;
}) {
  const router = useRouter();

  const buildHref = (overrides: { granularity?: Granularity; range?: number; service_id?: string }) => {
    const g = overrides.granularity ?? granularity;
    const r = overrides.range ?? (overrides.granularity ? RANGE_OPTIONS[overrides.granularity][0] : range);
    const s = overrides.service_id !== undefined ? overrides.service_id : serviceId;
    const params = new URLSearchParams({ granularity: g, range: String(r) });
    if (s) params.set("service_id", s);
    return `/admin/analytics?${params.toString()}`;
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildHref({ service_id: e.target.value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex gap-2 text-sm">
        {(["day", "month"] as Granularity[]).map((g) => (
          <Link
            key={g}
            href={buildHref({ granularity: g })}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              granularity === g ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {g === "day" ? "日別" : "月別"}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 text-sm">
        {RANGE_OPTIONS[granularity].map((r) => (
          <Link
            key={r}
            href={buildHref({ range: r })}
            className={`px-3 py-2 rounded-xl font-medium transition-colors ${
              range === r ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {granularity === "day" ? `${r}日` : `${r}ヶ月`}
          </Link>
        ))}
      </div>

      <select
        value={serviceId}
        onChange={handleServiceChange}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">全サービス（全体）</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
