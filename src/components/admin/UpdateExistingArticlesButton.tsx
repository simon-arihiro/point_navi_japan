"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdateExistingArticlesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/articles/refresh-invitation-titles", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "更新に失敗しました");
      setMessage(`${json.prefix} に更新しました（タイトル${json.updated}/${json.total}件、本文強調${json.contentUpdated}件）`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-xs text-gray-500">{message}</span>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "更新中..." : "既存記事を更新"}
      </button>
    </div>
  );
}
