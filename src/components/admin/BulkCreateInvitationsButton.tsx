"use client";

import { useState } from "react";

export default function BulkCreateInvitationsButton() {
  const [state, setState] = useState<"idle" | "checking" | "confirming" | "running" | "done">("idle");
  const [missing, setMissing] = useState<{ id: string; name: string; referral_code: string | null }[]>([]);
  const [results, setResults] = useState<{ service_id: string; ok: boolean; error?: string }[]>([]);
  const [progress, setProgress] = useState(0);

  const check = async () => {
    setState("checking");
    const res = await fetch("/api/admin/articles/bulk-create-invitations");
    const json = await res.json();
    setMissing(json.missing ?? []);
    setState("confirming");
  };

  const run = async () => {
    if (missing.length === 0) return;
    setState("running");
    setProgress(0);
    const res = await fetch("/api/admin/articles/bulk-create-invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_ids: missing.map((m) => m.id) }),
    });
    const json = await res.json();
    setResults(json.results ?? []);
    setState("done");
  };

  if (state === "idle") {
    return (
      <button
        onClick={check}
        className="px-3 py-1.5 rounded-lg text-sm border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold transition-colors"
      >
        📩 招待コード記事を一括作成
      </button>
    );
  }

  if (state === "checking") {
    return <button disabled className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-400">確認中...</button>;
  }

  if (state === "confirming") {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
          <h2 className="font-black text-gray-900 text-lg mb-3">📩 招待コード記事 一括作成</h2>
          {missing.length === 0 ? (
            <p className="text-green-700 font-bold mb-4">✅ 全サービスに招待コード記事があります！</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">以下 {missing.length} サービスに招待コード記事がありません。AIで作成しますか？</p>
              <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto mb-4 space-y-1">
                {missing.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">{m.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{m.referral_code ?? "コードなし"}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mb-4">⚠️ AI生成には時間がかかります（1件あたり約15〜30秒）。合計約{Math.ceil(missing.length * 20 / 60)}分かかる場合があります。</p>
            </>
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setState("idle")} className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              キャンセル
            </button>
            {missing.length > 0 && (
              <button onClick={run} className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-bold hover:bg-purple-700">
                {missing.length}件を一括生成
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state === "running") {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h2 className="font-black text-gray-900 text-lg mb-2">AI記事生成中...</h2>
          <p className="text-sm text-gray-500">{missing.length}件の招待コード記事を生成しています。しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  // done
  const okCount = results.filter((r) => r.ok).length;
  const ngCount = results.filter((r) => !r.ok).length;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <h2 className="font-black text-gray-900 text-lg mb-3">✅ 一括生成 完了</h2>
        <p className="text-sm text-gray-600 mb-3">成功 {okCount}件 / 失敗 {ngCount}件</p>
        {ngCount > 0 && (
          <div className="bg-red-50 rounded-xl p-3 mb-4 text-xs text-red-700 max-h-40 overflow-y-auto space-y-1">
            {results.filter((r) => !r.ok).map((r) => (
              <p key={r.service_id}>{r.service_id}: {r.error}</p>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <button onClick={() => { setState("idle"); window.location.reload(); }} className="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white font-bold hover:bg-brand-700">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
