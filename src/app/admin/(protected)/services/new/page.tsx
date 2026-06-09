"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    official_url: "",
    referral_code: "",
    referral_link: "",
    logo_url: "",
    status: "active",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        description: "",
        referral_code: form.referral_code || null,
        referral_link: form.referral_link || null,
        logo_url: form.logo_url || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "エラーが発生しました");
      setLoading(false);
      return;
    }

    const { data: service } = await res.json();

    // AI でサービス情報を自動生成
    await fetch("/api/ai/generate-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: service.id }),
    });

    router.push("/admin/services");
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← 戻る</button>
        <h1 className="text-2xl font-black text-gray-900">サービスを追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        {[
          { label: "サービス名 *", key: "name", type: "text", placeholder: "例: トリマ" },
          { label: "スラッグ *", key: "slug", type: "text", placeholder: "例: torima" },
          { label: "公式URL *", key: "official_url", type: "url", placeholder: "https://..." },
          { label: "招待コード", key: "referral_code", type: "text", placeholder: "例: ABC123" },
          { label: "招待リンク", key: "referral_link", type: "url", placeholder: "https://..." },
          { label: "ロゴURL", key: "logo_url", type: "url", placeholder: "https://..." },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={(form as any)[key]}
              onChange={set(key)}
              placeholder={placeholder}
              required={label.includes("*")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select
            value={form.status}
            onChange={set("status")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-4 py-3">
          保存後、AIが自動でサービス情報（description、カテゴリ、タグ）を補完し、紹介記事を生成します。
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "保存中・AI生成中..." : "保存してAI生成を開始"}
        </button>
      </form>
    </div>
  );
}
