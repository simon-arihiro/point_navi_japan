"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-black text-gray-900 mb-8">システム設定</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">運用モード</label>
          <select
            value={settings?.operation_mode ?? "manual"}
            onChange={set("operation_mode")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="manual">MANUAL（AI生成→審査→公開）</option>
            <option value="auto">AUTO（AI生成→自動公開）</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">MANUAL: 管理者が承認してから公開されます</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="auto_generate_enabled"
            checked={settings?.auto_generate_enabled ?? true}
            onChange={set("auto_generate_enabled")}
            className="w-4 h-4 text-red-600"
          />
          <label htmlFor="auto_generate_enabled" className="text-sm font-medium text-gray-700">
            AI自動生成を有効化（Cronによる毎日の自動記事生成）
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">審査待ち上限数</label>
          <input
            type="number"
            min={1}
            max={50}
            value={settings?.max_pending_articles ?? 10}
            onChange={set("max_pending_articles")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-400 mt-1">reviewing 状態の記事がこの数を超えると自動生成を一時停止</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="auto_distribution"
            checked={settings?.auto_distribution ?? false}
            onChange={set("auto_distribution")}
            className="w-4 h-4 text-red-600"
          />
          <label htmlFor="auto_distribution" className="text-sm font-medium text-gray-700">
            自動SNS配信（記事公開後に自動配信）
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">毎日の自動生成記事数</label>
          <input
            type="number"
            min={0}
            max={10}
            value={settings?.daily_article_count ?? 1}
            onChange={set("daily_article_count")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
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

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
            saved ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"
          } disabled:opacity-50`}
        >
          {saved ? "保存しました ✓" : saving ? "保存中..." : "設定を保存"}
        </button>
      </div>
    </div>
  );
}
