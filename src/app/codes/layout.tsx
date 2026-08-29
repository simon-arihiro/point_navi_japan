export const dynamic = "force-dynamic";

import BoardLeftNav from "./BoardLeftNav";
import BoardRightSidebar from "./BoardRightSidebar";

async function getBoardStats() {
  // SSR時はAPI経由でなく直接取得
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const { data: submissions } = await supabase
    .from("code_submissions")
    .select("service_id");

  const countMap: Record<string, number> = {};
  for (const s of submissions ?? []) {
    countMap[s.service_id] = (countMap[s.service_id] ?? 0) + 1;
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, name, slug, logo_url, logo_storage_path, official_url")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  const servicesWithCount = (services ?? []).map((s) => ({
    ...s,
    submission_count: countMap[s.id] ?? 0,
  }));

  const { data: recent } = await supabase
    .from("code_submissions")
    .select("id, service_id, nickname, referral_code, comment, created_at, service:services!code_submissions_service_id_fkey(name, slug)")
    .order("created_at", { ascending: false })
    .limit(8);

  const ranking = [...servicesWithCount]
    .filter((s) => s.submission_count > 0)
    .sort((a, b) => b.submission_count - a.submission_count)
    .slice(0, 8);

  // Supabaseはリレーションを配列で返すが実際は単一オブジェクト
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { services: servicesWithCount, recent: (recent ?? []) as any, ranking };
}

export default async function CodesLayout({ children }: { children: React.ReactNode }) {
  const { services, recent, ranking } = await getBoardStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* モバイル専用: サービスメニューアコーディオン（flexの外に配置） */}
      <div className="lg:hidden">
        <BoardLeftNav services={services} mobileOnly />
      </div>

      <div className="flex gap-6 items-start">
        {/* 左サイドバー（PC only） */}
        <div className="hidden lg:block">
          <BoardLeftNav services={services} />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {children}

          {/* 右サイドバー残り（モバイルではメインコンテンツの下） */}
          <div className="lg:hidden mt-6">
            <BoardRightSidebar recent={recent} ranking={ranking} />
          </div>
        </main>

        {/* 右サイドバー（PC only） */}
        <div className="hidden lg:block">
          <BoardRightSidebar recent={recent} ranking={ranking} />
        </div>
      </div>
    </div>
  );
}
