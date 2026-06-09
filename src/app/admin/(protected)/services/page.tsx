import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoFallback from "@/components/LogoFallback";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "サービス管理" };

export default async function AdminServicesPage() {
  const supabase = await createAdminClient();

  const { data: services } = await supabase
    .from("services")
    .select(`*, categories:service_categories(category:categories(*))`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-gray-900">サービス管理</h1>
        <Link href="/admin/services/new" className="bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors">
          + 新規追加
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">サービス</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">カテゴリ</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">ステータス</th>
              <th className="text-left text-xs text-gray-500 font-medium px-3 py-3">招待コード</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(services ?? []).map((svc: any) => (
              <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <LogoFallback
                      name={svc.name}
                      logoUrl={svc.logo_url}
                      logoStoragePath={svc.logo_storage_path}
                      officialUrl={svc.official_url}
                      size={36}
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{svc.name}</p>
                      <p className="text-xs text-gray-400">{svc.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className="text-xs text-gray-600">
                    {svc.categories?.[0]?.category?.name ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${svc.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {svc.status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <code className="text-xs text-gray-600">{svc.referral_code ?? "—"}</code>
                </td>
                <td className="px-3 py-4 text-right">
                  <Link href={`/admin/services/${svc.id}`} className="text-sm text-red-600 hover:underline">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(services ?? []).length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">サービスはまだ登録されていません</div>
        )}
      </div>
    </div>
  );
}
