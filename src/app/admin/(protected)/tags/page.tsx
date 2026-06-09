"use client";

import { useState, useEffect } from "react";

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w぀-鿿-]/g, "") || name.trim();
}

export default function AdminTagsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const load = () =>
    fetch("/api/tags").then((r) => r.json()).then(({ data }) => { setItems(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugEdited) setSlug(toSlug(v));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const finalSlug = slug || toSlug(name);
    setSaving(true);
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: finalSlug }),
    });
    setName(""); setSlug(""); setSlugEdited(false);
    setSaving(false);
    load();
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug }),
    });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    load();
  };

  const startEdit = (item: any) => {
    setEditId(item.id); setEditName(item.name); setEditSlug(item.slug);
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900 mb-8">タグ管理</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-4 text-sm">新規追加</h2>
        <div className="flex gap-3 mb-3">
          <input
            type="text" placeholder="名前（例：キャッシュバック）" value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button type="submit" disabled={saving || !name} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            追加
          </button>
        </div>
        <div>
          <input
            type="text" placeholder="slug（自動生成・変更可）" value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">タグがありません</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-b-0">
              {editId === item.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <button onClick={() => handleUpdate(item.id)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">保存</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:text-gray-700">キャンセル</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{item.slug}</span>
                  <button onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:text-blue-700 px-2">編集</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 px-2">削除</button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
