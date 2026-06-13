"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Category, resolveCategoryIds } from "@/lib/categories";
import CategorySelector from "@/components/admin/CategorySelector";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/campaign";
import PromptInputWithImages, { PendingImage } from "@/components/admin/PromptInputWithImages";

export default function EditServicePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [form, setForm] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  // AI記事生成
  const [genType, setGenType] = useState<"introduction" | "related" | "invitation">("related");
  const [genPrompt, setGenPrompt] = useState("");
  const [genImages, setGenImages] = useState<PendingImage[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

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
        bonus_points: form.bonus_points === "" || form.bonus_points == null ? null : Number(form.bonus_points),
        bonus_amount: form.bonus_amount === "" || form.bonus_amount == null ? null : form.bonus_amount,
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
    if (!confirm(`「${form.name}」をゴミ箱に移動しますか？関連する記事もまとめてゴミ箱に移動されます。ゴミ箱から復元することもできます。`)) return;
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

  // AI補完: サービス名をもとにWeb検索で説明・カテゴリ・付与ポイント/金額・キャンペーン情報・ロゴURL・公式URLを調査しフォームに反映する（保存ボタンを押すまでDBは更新されない）
  const handleAutofill = async () => {
    if (!form.name) {
      setAiError("AI補完にはサービス名が必要です");
      return;
    }
    setAiError("");
    setAiLoading(true);

    const res = await fetch("/api/ai/autofill-service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, official_url: form.official_url || null }),
    });

    if (!res.ok) {
      const data = await res.json();
      setAiError(data.error?.message ?? "AI補完に失敗しました");
      setAiLoading(false);
      return;
    }

    const { data } = await res.json();

    setForm((prev: typeof form) => ({
      ...prev,
      official_url: prev.official_url || data.official_url || prev.official_url,
      description: data.description || prev.description,
      bonus_points: data.bonus_points != null ? String(data.bonus_points) : prev.bonus_points,
      bonus_amount: data.bonus_amount || prev.bonus_amount,
      campaign_bonus: data.campaign_bonus || prev.campaign_bonus,
      campaign_expires_at: data.campaign_expires_at ? toDatetimeLocalValue(data.campaign_expires_at) : prev.campaign_expires_at,
      logo_url: data.logo_url || prev.logo_url,
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

  // AI記事生成: プロンプト・参考URL・添付画像をもとに記事を生成し、審査待ちとして保存する
  const handleGenerate = async () => {
    setGenError("");
    setGenerating(true);

    const res = await fetch("/api/ai/generate-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: id,
        article_type: genType === "related" ? undefined : genType,
        extra_prompt: genPrompt,
        images: genImages.map((img) => ({ data: img.data, media_type: img.mediaType })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setGenError(data?.error?.message ?? "AI記事生成に失敗しました");
      setGenerating(false);
      return;
    }

    const { article_id } = await res.json();
    router.push(`/admin/articles/${article_id}`);
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
          { label: "付与ポイント", key: "bonus_points", type: "number" },
          { label: "付与金額", key: "bonus_amount", type: "text", placeholder: "例: 25〜30（「約」「円」は自動表示）" },
          { label: "キャンペーン内容", key: "campaign_bonus", type: "text" },
          { label: "キャンペーン終了日時", key: "campaign_expires_at", type: "datetime-local" },
          { label: "ロゴURL", key: "logo_url", type: "url" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={form[key] ?? ""}
              onChange={set(key)}
              placeholder={placeholder}
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
        {aiError && <p className="text-amber-600 text-sm">{aiError}</p>}

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAutofill}
              disabled={aiLoading || saving}
              className="bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {aiLoading ? "AI補完中..." : "AI補完"}
            </button>
            <button type="submit" disabled={saving || aiLoading} className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            {deleting ? "移動中..." : "ゴミ箱に移動"}
          </button>
        </div>
      </form>

      {/* AI記事生成 */}
      <div id="ai-generate" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6 scroll-mt-6">
        <h2 className="font-bold text-gray-900 mb-1">AI記事生成</h2>
        <p className="text-xs text-gray-400 mb-4">
          プロンプト・参考URL・画像（コピー&ペーストで添付可能）をもとにAIが記事を作成します。生成された記事は「審査待ち」として保存されるため、内容を確認してから公開してください。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">記事の種類</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGenType("introduction")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  genType === "introduction" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                紹介記事
              </button>
              <button
                type="button"
                onClick={() => setGenType("related")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  genType === "related" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                関連記事
              </button>
              <button
                type="button"
                onClick={() => setGenType("invitation")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  genType === "invitation" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                招待記事
              </button>
            </div>
            {(genType === "introduction" || genType === "invitation") && (
              <p className="text-xs text-gray-400 mt-1">既存の{genType === "introduction" ? "紹介" : "招待"}記事がある場合は内容が上書きされます</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロンプト・参考情報</label>
            <PromptInputWithImages
              value={genPrompt}
              onChange={setGenPrompt}
              images={genImages}
              onImagesChange={setGenImages}
              placeholder={"記事に反映したい内容、参考にするキャンペーンページのURL、画像などを入力してください。\n例: このスクリーンショットは先月の収益実績です。本文の「実際の収益」セクションに挿入してください。"}
              disabled={generating}
            />
          </div>

          {genError && <p className="text-red-600 text-sm">{genError}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? "生成中..." : "AIに記事生成を依頼"}
          </button>
        </div>
      </div>
    </div>
  );
}
