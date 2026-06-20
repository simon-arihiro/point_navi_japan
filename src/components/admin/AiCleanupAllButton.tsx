"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FEEDBACK = `この記事は文章の「文体・言い回し」だけを修正してください。AI生成記事特有の不自然な定型表現（テンプレ的な書き出し・締めの一文など）や硬い言い回しを、りすくんのリアルな体験談風の自然な文体に書き直してください。

【絶対に変更してはいけないもの】
- 見出しの構成・順序・階層（見出しの追加・削除・並び替えは禁止）
- 各見出しで説明している内容・趣旨・主張
- 記載されている事実情報（サービス名、金額、条件、手順など）
- 段落の構成・情報量（要約したり内容を増やしたりしないこと）
- 本文中の画像（![説明](URL)形式）は1枚も削除せず、すべて元と同じ位置に残すこと。特に先頭のサムネイル画像は絶対に削除・移動しないこと

あくまで「同じ内容を、より自然な文章表現で言い換える」だけの修正にとどめてください。`;

export default function AiCleanupAllButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);

  const handleClick = async () => {
    if (running) return;
    if (!confirm("公開中・公開待ち・審査待ちの全記事の文体だけをAIで修正します（構成・内容・画像は変更しません）。記事数によっては時間がかかりますが、よろしいですか？")) return;

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
        title="公開中・公開待ち・審査待ちの全記事の文体だけをAIで修正します（見出し構成・内容・画像は変更しません）"
        className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {running ? "AI文体を修正中..." : "AI文体を一括修正"}
      </button>
    </div>
  );
}
