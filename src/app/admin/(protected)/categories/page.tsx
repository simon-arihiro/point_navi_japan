"use client";

import { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setItems((prev) => [...prev, json.data]);
        setName("");
      } else {
        setError(json.error?.message ?? `エラー: ${res.status}`);
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」をゴミ箱に移動しますか？ゴミ箱から復元することもできます。`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("削除に失敗しました");
    }
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900 mb-8">カテゴリ管理</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4 text-sm">新規追加</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="カテゴリ名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="shrink-0 whitespace-nowrap bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? "追加中..." : "追加"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">カテゴリがありません</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-50 last:border-b-0">
              <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 whitespace-nowrap">
                  関連サービス {item.service_categories?.[0]?.count ?? 0}件
                </span>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
