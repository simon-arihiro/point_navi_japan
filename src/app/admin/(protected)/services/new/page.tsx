"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, resolveCategoryIds } from "@/lib/categories";
import CategorySelector from "@/components/admin/CategorySelector";
import { fromDatetimeLocalValue } from "@/lib/campaign";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    official_url: "",
    referral_code: "",
    referral_link: "",
    campaign_bonus: "",
    campaign_expires_at: "",
    logo_url: "",
    description: "",
    status: "active",
  });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(({ data }) => setAllCategories(data ?? []));
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleCategory = (name: string) => {
    setCategoryNames((prev) =>
      prev.some((c) => c.toLowerCase() === name.toLowerCase())
        ? prev.filter((c) => c.toLowerCase() !== name.toLowerCase())
        : [...prev, name]
    );
  };

  const handleAutofill = async () => {
    if (!form.official_url) {
      setAiError("AI補完には公式URLが必要です");
      return;
    }
    setAiError("");
    setAiLoading(true);

    const res = await fetch("/api/ai/autofill-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ official_url: form.official_url }),
    });

    if (!res.ok) {
      const data = await res.json();
      setAiError(data.error?.message ?? "AI補完に失敗しました");
      setAiLoading(false);
      return;
    }

    const { data } = await res.json();

    setForm((prev) => ({
      ...prev,
      slug: prev.slug || data.slug || prev.slug,
      description: data.description || prev.description,
    }));

    if (Array.isArray(data.categories)) {
      // AI補完の結果で選択中のカテゴリを上書きする
      const aiCategories: string[] = [];
      for (const name of data.categories) {
        const trimmed = String(name).trim();
        if (trimmed && !aiCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
          aiCategories.push(trimmed);
        }
      }
      if (aiCategories.length > 0) setCategoryNames(aiCategories);
    }

    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // カテゴリ名 → ID解決（既存は一致させ、未存在は新規作成）
    const category_ids = await resolveCategoryIds(categoryNames, allCategories, (newCat) =>
      setAllCategories((prev) => [...prev, newCat])
    );

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        referral_code: form.referral_code || null,
        referral_link: form.referral_link || null,
        campaign_bonus: form.campaign_bonus || null,
        campaign_expires_at: fromDatetimeLocalValue(form.campaign_expires_at),
        logo_url: form.logo_url || null,
        category_ids,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "エラーが発生しました");
      setLoading(false);
      return;
    }

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
          { label: "キャンペーン内容", key: "campaign_bonus", type: "text", placeholder: "例: 期間限定+1,000pt" },
          { label: "キャンペーン終了日時", key: "campaign_expires_at", type: "datetime-local", placeholder: "" },
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
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="AI補完で自動入力されます（手動入力も可）"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <CategorySelector allCategories={allCategories} selected={categoryNames} onToggle={toggleCategory} />

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
        {aiError && <p className="text-amber-600 text-sm">{aiError}</p>}

        <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-4 py-3">
          「AI補完」を押すと、公式URLをもとに説明文とカテゴリ案を自動入力します（紹介記事は生成されません）。内容を確認・修正のうえ「追加」を押してください。
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAutofill}
            disabled={aiLoading || loading}
            className="flex-1 bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {aiLoading ? "AI補完中..." : "AI補完"}
          </button>
          <button
            type="submit"
            disabled={loading || aiLoading}
            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "追加中..." : "追加"}
          </button>
        </div>
      </form>
    </div>
  );
}
