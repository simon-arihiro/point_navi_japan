"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AI_TASKS, AI_PROVIDERS, DEFAULT_AI_PROVIDER_SETTINGS, providersForTask } from "@/lib/ai/providers";
import type { AiPrompt, AiProviderId, AiTaskId } from "@/types/database";

export default function AdminAiSettingsPage() {
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

  const toggleMultiEnabled = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, ai_multi_provider_enabled: e.target.checked }));
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
      <h1 className="text-2xl font-black text-gray-900 mb-4">AI設定</h1>

      <div className="flex gap-2 mb-6 text-sm">
        <Link href="/admin/settings" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          システム設定
        </Link>
        <span className="px-4 py-2 rounded-xl bg-white border border-gray-100 font-bold text-gray-900">AI設定</span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AIプロバイダー優先順位</h2>
          <p className="text-xs text-gray-400 mt-1">AI機能ごとに使用するAIサービスと優先順位を設定します</p>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="ai_multi_provider_enabled"
            checked={settings?.ai_multi_provider_enabled ?? false}
            onChange={toggleMultiEnabled}
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

      <AiPromptLibrary />
    </div>
  );
}

// AIにコンテンツ作成を依頼する際に参考にするプロンプトを保存・閲覧するライブラリ
function AiPromptLibrary() {
  const [items, setItems] = useState<AiPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ai-prompts")
      .then((r) => r.json())
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      const json = await res.json();
      if (res.ok) {
        setItems((prev) => [json.data, ...prev]);
        setTitle("");
        setContent("");
      } else {
        setError(json.error?.message ?? `エラー: ${res.status}`);
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setSaving(false);
  };

  const startEdit = (item: AiPrompt) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleEditSave = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setEditSaving(true);
    const res = await fetch(`/api/ai-prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), content: editContent }),
    });
    if (res.ok) {
      const json = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? json.data : item)));
      setEditingId(null);
    } else {
      alert("保存に失敗しました");
    }
    setEditSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    const res = await fetch(`/api/ai-prompts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("削除に失敗しました");
    }
  };

  const handleSetDefault = async (id: string, isDefault: boolean) => {
    const res = await fetch(`/api/ai-prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: isDefault }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((item) => ({ ...item, is_default: item.id === id ? isDefault : false })));
    } else {
      alert("更新に失敗しました");
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-1">AIプロンプトライブラリ</h2>
      <p className="text-xs text-gray-400 mb-4">
        AIにコンテンツ作成を依頼する際に参考にするプロンプトを保存・閲覧できます。「デフォルト」に設定したプロンプトは、AI記事生成のたびに最優先指示として自動的に適用されます。
      </p>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">新規追加</h3>
        <input
          type="text"
          placeholder="タイトル（例: 記事執筆スタイル指示）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <textarea
          placeholder="プロンプト本文"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="shrink-0 whitespace-nowrap bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? "追加中..." : "追加"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      {loading ? (
        <div className="text-gray-400 text-sm">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-10 text-gray-400 text-sm">
          プロンプトがありません
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(item.id)}
                      disabled={editSaving}
                      className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                      {editSaving ? "保存中..." : "保存"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 px-4 py-1.5 rounded-lg text-xs hover:bg-gray-100"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm break-words flex items-center gap-2">
                      {item.title}
                      {item.is_default && (
                        <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                          デフォルト
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleSetDefault(item.id, !item.is_default)}
                        className={`text-xs ${item.is_default ? "text-gray-400 hover:text-gray-600" : "text-red-500 hover:text-red-700"}`}
                      >
                        {item.is_default ? "デフォルト解除" : "デフォルトに設定"}
                      </button>
                      <button onClick={() => startEdit(item)} className="text-xs text-gray-500 hover:text-gray-700">
                        編集
                      </button>
                      <button onClick={() => handleDelete(item.id, item.title)} className="text-xs text-red-500 hover:text-red-700">
                        削除
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap break-words">{item.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
