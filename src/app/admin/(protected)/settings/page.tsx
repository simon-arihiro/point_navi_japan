"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ data }) => { setSettings(data); setLoading(false); });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (res.ok) {
        setSettings(json.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(json.error?.message ?? `エラー: ${res.status}`);
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-black text-gray-900 mb-4">システム設定</h1>

      <div className="flex gap-2 mb-6 text-sm">
        <span className="px-4 py-2 rounded-xl bg-white border border-gray-100 font-bold text-gray-900">システム設定</span>
        <Link href="/admin/settings/ai" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          AI設定
        </Link>
        <Link href="/admin/settings/sns" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          SNS配信設定
        </Link>
        <Link href="/admin/settings/publish-schedule" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          定時発行設定
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">運用モード</label>
          <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-700 font-medium">
            MANUAL（AI生成 → 管理者が確認・編集 → 公開）
          </div>
          <p className="text-xs text-gray-400 mt-1">AUTOモード（AIによる自動生成・自動公開・自動SNS配信）は今後のバージョンで対応予定です</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ランキング集計期間（日）</label>
          <input
            type="number"
            min={7}
            max={365}
            value={settings?.ranking_window_days ?? 30}
            onChange={set("ranking_window_days")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hide_articles_on_inactive"
            checked={settings?.hide_articles_on_inactive ?? false}
            onChange={set("hide_articles_on_inactive")}
            className="w-4 h-4 text-red-600"
          />
          <label htmlFor="hide_articles_on_inactive" className="text-sm font-medium text-gray-700">
            inactive な Service の公開済み記事を非表示にする
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 mt-6 rounded-xl text-sm font-bold transition-colors ${
          saved ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"
        } disabled:opacity-50`}
      >
        {saved ? "保存しました ✓" : saving ? "保存中..." : "設定を保存"}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center mt-2">保存に失敗しました: {error}</p>
      )}
    </div>
  );
}
