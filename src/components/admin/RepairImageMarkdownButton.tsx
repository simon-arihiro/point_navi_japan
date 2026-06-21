"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RepairImageMarkdownButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;
    if (!confirm("AIが ![説明] と (画像URL) を改行で分断してしまい表示されなくなった本文中の画像を、すべての記事で一括修復します。よろしいですか？")) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/articles/repair-image-markdown", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "修復に失敗しました");
      setMessage(`${json.fixed}/${json.total}件を修復しました`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "修復に失敗しました");
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
        title="AIが画像Markdownを改行で分断してしまい本文中の画像が表示されなくなった記事を一括修復します"
        className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "修復中..." : "崩れた画像表示を修復"}
      </button>
    </div>
  );
}
