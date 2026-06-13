"use client";

import { useRouter } from "next/navigation";

type Props = {
  count: number;
};

// サムネイル自動生成の失敗（Gemini無料枠上限など）を知らせるバナー
export default function ImageFailedBanner({ count }: Props) {
  const router = useRouter();
  if (count === 0) return null;

  const handleDismiss = async () => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "image_failed" }),
    });
    router.refresh();
  };

  return (
    <div className="mb-8 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
      <span className="text-sm text-orange-800 font-medium">
        🎨 サムネイル自動生成に失敗した記事が{count}件あります（Gemini無料枠の上限などが原因の可能性）
      </span>
      <button onClick={handleDismiss} className="text-xs text-orange-600 hover:underline shrink-0 ml-3">
        既読にする
      </button>
    </div>
  );
}
