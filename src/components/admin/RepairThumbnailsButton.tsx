"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RepairThumbnailsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;
    if (!confirm("先頭サムネイル画像が本文から消えてしまった記事を、保存済みの画像URLを使って復元します。よろしいですか？")) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/articles/repair-thumbnails", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "復元に失敗しました");
      setMessage(`${json.fixed}/${json.total}件を復元しました`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "復元に失敗しました");
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
        title="AIの書き直しで本文から消えてしまった先頭サムネイル画像を復元します（保存済みのサムネイルURLを使用）"
        className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "復元中..." : "消えたサムネイルを復元"}
      </button>
    </div>
  );
}
