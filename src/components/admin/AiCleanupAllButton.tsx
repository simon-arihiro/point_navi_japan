"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FEEDBACK = `この記事を全体的に見直し、AI生成記事特有の「テンプレ感」を徹底的に排除してください。書き出し・本文・締めのすべてを対象に、不自然な定型表現や当たり障りのない一般論を、りすくんのリアルな体験談風の文章に書き直してください。見出し構成・記事の趣旨・対象サービス・記載されている事実情報は変更しないこと。本文中の画像（特に先頭のサムネイル画像）は1枚も削除せず、すべてそのまま同じ位置に残すこと。`;

export default function AiCleanupAllButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);

  const handleClick = async () => {
    if (running) return;
    if (!confirm("公開中・公開待ち・審査待ちの全記事をAIで見直します。記事数によっては時間がかかりますが、よろしいですか？")) return;

    setRunning(true);
    setProgress(null);
    try {
      const listRes = await fetch("/api/admin/articles/ai-cleanup-targets");
      const { data: targets } = await listRes.json();
      const total = targets.length;
      let done = 0;
      let failed = 0;
      setProgress({ done, total, failed });

      for (const article of targets) {
        try {
          const res = await fetch("/api/ai/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ article_id: article.id, feedback: FEEDBACK, keep_status: true }),
          });
          if (!res.ok) failed += 1;
        } catch {
          failed += 1;
        }
        done += 1;
        setProgress({ done, total, failed });
      }
      router.refresh();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {progress && (
        <span className="text-xs text-gray-500">
          {progress.done}/{progress.total} 完了{progress.failed > 0 && `（失敗 ${progress.failed}件）`}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={running}
        className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {running ? "AI見直し中..." : "全記事をAIで一括見直し"}
      </button>
    </div>
  );
}
