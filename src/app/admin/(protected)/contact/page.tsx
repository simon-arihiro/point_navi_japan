"use client";

import { useState, useEffect } from "react";

export default function AdminContactPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const handleToggleRead = async (id: string, is_read: boolean) => {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read } : item)));
    }
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black text-gray-900 mb-8">お問い合わせ</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">お問い合わせはまだありません</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`px-5 py-4 border-b border-gray-50 last:border-b-0 ${item.is_read ? "" : "bg-orange-50"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {item.name} {!item.is_read && <span className="ml-2 text-xs text-orange-600 font-medium">未読</span>}
                  </p>
                  <p className="text-xs text-gray-500">{item.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-right">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString("ja-JP")}
                  </span>
                  <button
                    onClick={() => handleToggleRead(item.id, !item.is_read)}
                    className="text-xs text-brand-700 hover:underline whitespace-nowrap"
                  >
                    {item.is_read ? "未読にする" : "既読にする"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
