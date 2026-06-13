"use client";

import { useState, useEffect } from "react";
import { AI_TASKS, AI_PROVIDERS, DEFAULT_AI_PROVIDER_SETTINGS, providersForTask } from "@/lib/ai/providers";
import type { AiProviderId, AiTaskId } from "@/types/database";

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

  // AI設定: 指定タスクのプロバイダーを優先度順に並べた配列を返す（未設定対応プロバイダーは末尾に補完）
  const providerOrder = (taskId: AiTaskId): AiProviderId[] => {
    const capable = providersForTask(taskId).map((p) => p.id);
    const configured: AiProviderId[] = (settings?.ai_provider_settings?.[taskId] ?? DEFAULT_AI_PROVIDER_SETTINGS[taskId])
      .filter((id: AiProviderId) => capable.includes(id));
    return [...configured, ...capable.filter((id) => !configured.includes(id))];
  };

  // AI設定: 指定タスクのプロバイダーの優先順位を入れ替える
  const moveProvider = (taskId: AiTaskId, index: number, direction: 1 | -1) => {
    const order = providerOrder(taskId);
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setSettings({
      ...settings,
      ai_provider_settings: { ...(settings?.ai_provider_settings ?? {}), [taskId]: order },
    });
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
      <h1 className="text-2xl font-black text-gray-900 mb-8">システム設定</h1>

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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6 mt-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI設定</h2>
          <p className="text-xs text-gray-400 mt-1">AI機能ごとに使用するAIサービスと優先順位を設定します</p>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="ai_multi_provider_enabled"
            checked={settings?.ai_multi_provider_enabled ?? false}
            onChange={set("ai_multi_provider_enabled")}
            className="w-4 h-4 mt-0.5 text-red-600 shrink-0"
          />
          <label htmlFor="ai_multi_provider_enabled" className="text-sm">
            <span className="font-medium text-gray-700">複数AIの自動フォールバックを有効にする</span>
            <p className="text-xs text-gray-400 mt-0.5">
              オンにすると、優先度1位のAIが無料枠の上限・エラー等で使用できない場合、優先度2位以降のAIへ自動的に切り替えます。オフの場合は各機能で優先度1位のAIのみを使用します。
            </p>
          </label>
        </div>

        <div className="space-y-4">
          {AI_TASKS.map((task) => {
            const order = providerOrder(task.id);
            return (
              <div key={task.id} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700">{task.label}</p>
                <p className="text-xs text-gray-400 mb-3">{task.description}</p>
                <div className="space-y-1.5">
                  {order.map((providerId, i) => {
                    const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;
                    return (
                      <div key={providerId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                            {i + 1}
                          </span>
                          {provider.label}
                          {i === 0 && <span className="text-xs text-red-600 font-bold">優先</span>}
                        </span>
                        {order.length > 1 && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveProvider(task.id, i, -1)}
                              disabled={i === 0}
                              className="w-6 h-6 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProvider(task.id, i, 1)}
                              disabled={i === order.length - 1}
                              className="w-6 h-6 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              ↓
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
