"use client";

import { useState, useEffect } from "react";
import { TRASH_RETENTION_DAYS } from "@/lib/trash";

interface TrashItem {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  article_type?: string;
  deleted_at: string;
}

interface TrashData {
  services: TrashItem[];
  articles: TrashItem[];
  categories: TrashItem[];
}

type TrashType = "services" | "articles" | "categories";

const SECTION_LABELS: Record<TrashType, string> = {
  services: "サービス",
  articles: "記事",
  categories: "カテゴリ",
};

function daysRemaining(deletedAt: string): number {
  const expiresAt = new Date(deletedAt).getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function AdminTrashPage() {
  const [data, setData] = useState<TrashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [emptying, setEmptying] = useState(false);

  const load = () => {
    fetch("/api/admin/trash")
      .then((r) => r.json())
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleRestore = async (type: TrashType, item: TrashItem) => {
    const label = item.title ?? item.name ?? "";
    if (!confirm(`「${label}」を復元しますか？`)) return;
    const key = `${type}-${item.id}`;
    setBusyKey(key);
    const res = await fetch(`/api/admin/trash/${type}/${item.id}`, { method: "POST" });
    if (res.ok) {
      load();
    } else {
      alert("復元に失敗しました");
    }
    setBusyKey(null);
  };

  const handlePurge = async (type: TrashType, item: TrashItem) => {
    const label = item.title ?? item.name ?? "";
    if (!confirm(`「${label}」を完全に削除しますか？関連データもすべて削除され、この操作は元に戻せません。`)) return;
    if (!confirm("本当に完全削除します。よろしいですか？")) return;
    const key = `${type}-${item.id}`;
    setBusyKey(key);
    const res = await fetch(`/api/admin/trash/${type}/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      alert("完全削除に失敗しました");
    }
    setBusyKey(null);
  };

  const handleEmptyAll = async () => {
    if (!confirm("ゴミ箱内のすべてのアイテムを完全に削除しますか？関連データもすべて削除され、この操作は元に戻せません。")) return;
    if (!confirm("本当に完全削除します。よろしいですか？")) return;
    setEmptying(true);
    const res = await fetch("/api/admin/trash", { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      alert("ゴミ箱の空にする処理に失敗しました");
    }
    setEmptying(false);
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;
  if (!data) return <div className="text-red-600 text-sm">読み込みに失敗しました</div>;

  const sections: { type: TrashType; items: TrashItem[] }[] = [
    { type: "services", items: data.services },
    { type: "articles", items: data.articles },
    { type: "categories", items: data.categories },
  ];
  const totalCount = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-black text-gray-900">ゴミ箱</h1>
        {totalCount > 0 && (
          <button
            onClick={handleEmptyAll}
            disabled={emptying}
            className="text-xs font-medium text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 disabled:opacity-50 shrink-0"
          >
            {emptying ? "削除中..." : "ゴミ箱を空にする"}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-8">
        削除されたアイテムは{TRASH_RETENTION_DAYS}日間ここに保管されます。期限を過ぎると自動的に完全削除されます。
      </p>

      {totalCount === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
          ゴミ箱は空です
        </div>
      ) : (
        sections.map(({ type, items }) =>
          items.length === 0 ? null : (
            <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h2 className="font-bold text-gray-900 px-5 py-4 border-b border-gray-50 text-sm">{SECTION_LABELS[type]}</h2>
              {items.map((item) => {
                const key = `${type}-${item.id}`;
                const label = item.title ?? item.name ?? "";
                const remaining = daysRemaining(item.deleted_at);
                return (
                  <div key={key} className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-50 last:border-b-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                      <p className="text-xs text-gray-400">残り{remaining}日で完全削除されます</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestore(type, item)}
                        disabled={busyKey === key}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 disabled:opacity-50"
                      >
                        復元
                      </button>
                      <button
                        onClick={() => handlePurge(type, item)}
                        disabled={busyKey === key}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 disabled:opacity-50"
                      >
                        完全削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )
      )}
    </div>
  );
}
