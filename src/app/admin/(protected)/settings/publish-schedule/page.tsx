"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PublishSchedule } from "@/types/database";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function AdminPublishSchedulePage() {
  const [schedules, setSchedules] = useState<PublishSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [queuedCount, setQueuedCount] = useState<number | null>(null);
  const [newHour, setNewHour] = useState("8");
  const [newMinute, setNewMinute] = useState("0");
  const [newCount, setNewCount] = useState("1");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/publish-schedules")
      .then((r) => r.json())
      .then(({ data }) => { setSchedules(data ?? []); setLoading(false); });
  };

  useEffect(() => {
    load();
    fetch("/api/articles?status=queued&limit=1000")
      .then((r) => r.json())
      .then(({ data }) => setQueuedCount(Array.isArray(data) ? data.length : null))
      .catch(() => setQueuedCount(null));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    const res = await fetch("/api/admin/publish-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hour: Number(newHour), minute: Number(newMinute), count: Number(newCount) }),
    });
    const json = await res.json();
    if (res.ok) {
      setSchedules((prev) => [...prev, json.data].sort((a, b) => a.hour - b.hour || a.minute - b.minute));
      setNewHour("8");
      setNewMinute("0");
      setNewCount("1");
    } else {
      setError(json.error?.message ?? `エラー: ${res.status}`);
    }
    setCreating(false);
  };

  const handleToggle = async (s: PublishSchedule) => {
    const res = await fetch(`/api/admin/publish-schedules/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !s.enabled }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setSchedules((prev) => prev.map((p) => (p.id === s.id ? data : p)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このタイマーを削除しますか？")) return;
    const res = await fetch(`/api/admin/publish-schedules/${id}`, { method: "DELETE" });
    if (res.ok) setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-black text-gray-900 mb-4">定時発行設定</h1>

      <div className="flex gap-2 mb-6 text-sm">
        <Link href="/admin/settings" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          システム設定
        </Link>
        <Link href="/admin/settings/ai" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          AI設定
        </Link>
        <Link href="/admin/settings/sns" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          SNS配信設定
        </Link>
        <span className="px-4 py-2 rounded-xl bg-white border border-gray-100 font-bold text-gray-900">定時発行設定</span>
      </div>

      <p className="text-xs text-gray-400 mb-2">
        記事詳細画面で「代発行待ち」にした記事は、ここで設定したタイマーが発火するたびに、更新日時が最も古いものから指定件数だけ自動公開されます。
        時刻はすべて日本時間（JST）です。タイマーは複数登録でき、時間帯ごとに発行件数を変えられます。
      </p>
      {queuedCount !== null && (
        <p className="text-xs text-blue-600 mb-4">現在「代発行待ち」の記事: {queuedCount} 件</p>
      )}
      <p className="text-xs text-gray-400 mb-6">
        ※ 分（分）を0以外に設定した場合、Vercelの標準cronは時報（00分）にしか実行されないため発火しません。0分以外を使う場合は外部スケジューラから本エンドポイントを数分おきに呼び出す運用に切り替えてください。
      </p>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-900 mb-3 text-sm">タイマーを追加</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">時（JST）</label>
            <select value={newHour} onChange={(e) => setNewHour(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{pad(h)}時</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">分</label>
            <input
              type="number" min={0} max={59} value={newMinute}
              onChange={(e) => setNewMinute(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">発行件数</label>
            <input
              type="number" min={1} value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {creating ? "追加中..." : "+ タイマーを追加"}
        </button>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      <div className="space-y-3">
        {schedules.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            タイマーが登録されていません
          </div>
        )}
        {schedules.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">{pad(s.hour)}:{pad(s.minute)} に {s.count}件 発行</p>
              <p className="text-xs text-gray-400">最終実行日: {s.last_run_date ?? "未実行"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  s.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.enabled ? "有効" : "無効"}
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
