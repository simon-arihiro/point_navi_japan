"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Category, resolveCategoryIds } from "@/lib/categories";
import CategorySelector from "@/components/admin/CategorySelector";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/campaign";

export default function EditServicePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setForm({ ...data, campaign_expires_at: toDatetimeLocalValue(data.campaign_expires_at) });
        setCategoryNames((data.categories ?? []).map((c: any) => c.category?.name).filter(Boolean));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(({ data }) => setAllCategories(data ?? []));
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev: any) => ({ ...prev, [key]: e.target.value }));

  const toggleCategory = (name: string) => {
    setCategoryNames((prev) =>
      prev.some((c) => c.toLowerCase() === name.toLowerCase())
        ? prev.filter((c) => c.toLowerCase() !== name.toLowerCase())
        : [...prev, name]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const category_ids = resolveCategoryIds(categoryNames, allCategories);

    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        campaign_bonus: form.campaign_bonus || null,
        campaign_expires_at: fromDatetimeLocalValue(form.campaign_expires_at),
        category_ids,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error?.message ?? "エラーが発生しました");
    } else {
      router.push("/admin/services");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`「${form.name}」を削除しますか？関連する記事・画像・カテゴリ紐付けもすべて削除されます。この操作は元に戻せません。`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/services");
    } else {
      const d = await res.json().catch(() => null);
      setError(d?.error?.message ?? "削除に失敗しました");
      setDeleting(false);
    }
  };

  const handleRegenerateIntro = async () => {
    await fetch("/api/ai/generate-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: id }),
    });
    alert("紹介記事の再生成を開始しました");
  };

  const handleGenerateArticle = async () => {
    await fetch("/api/ai/generate-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: id }),
    });
    alert("関連記事の生成を開始しました");
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;
  if (!form) return <div className="text-red-600 text-sm">サービスが見つかりません</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← 戻る</button>
        <h1 className="text-2xl font-black text-gray-900">サービス編集</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        {[
          { label: "サービス名", key: "name", type: "text" },
          { label: "スラッグ", key: "slug", type: "text" },
          { label: "公式URL", key: "official_url", type: "url" },
          { label: "招待コード", key: "referral_code", type: "text" },
          { label: "招待リンク", key: "referral_link", type: "url" },
          { label: "キャンペーン内容", key: "campaign_bonus", type: "text" },
          { label: "キャンペーン終了日時", key: "campaign_expires_at", type: "datetime-local" },
          { label: "ロゴURL", key: "logo_url", type: "url" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={form[key] ?? ""}
              onChange={set(key)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description ?? ""}
            onChange={set("description")}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
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

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? "削除中..." : "削除"}
          </button>
          <button
            type="button"
            onClick={handleRegenerateIntro}
            className="bg-blue-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            紹介記事
          </button>
          <button
            type="button"
            onClick={handleGenerateArticle}
            className="bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            関連記事
          </button>
        </div>
      </form>
    </div>
  );
}
