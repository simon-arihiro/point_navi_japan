"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SNS_PLATFORMS } from "@/lib/sns/platforms";
import type { SnsPlatformSettings } from "@/types/database";

export default function AdminSnsSettingsPage() {
  const [settings, setSettings] = useState<{ sns_platform_settings?: SnsPlatformSettings } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ data }) => { setSettings(data); setLoading(false); });
  }, []);

  const platformSettings = settings?.sns_platform_settings ?? {};

  const toggleEnabled = (platformId: string) => {
    setSettings((prev) => ({
      ...prev,
      sns_platform_settings: {
        ...platformSettings,
        [platformId]: {
          enabled: !platformSettings[platformId as keyof SnsPlatformSettings]?.enabled,
          credentials: platformSettings[platformId as keyof SnsPlatformSettings]?.credentials ?? {},
        },
      },
    }));
  };

  const setCredential = (platformId: string, fieldKey: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      sns_platform_settings: {
        ...platformSettings,
        [platformId]: {
          enabled: platformSettings[platformId as keyof SnsPlatformSettings]?.enabled ?? false,
          credentials: { ...(platformSettings[platformId as keyof SnsPlatformSettings]?.credentials ?? {}), [fieldKey]: value },
        },
      },
    }));
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
      <h1 className="text-2xl font-black text-gray-900 mb-4">SNS配信設定</h1>

      <div className="flex gap-2 mb-6 text-sm">
        <Link href="/admin/settings" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          システム設定
        </Link>
        <Link href="/admin/settings/ai" className="px-4 py-2 rounded-xl text-gray-500 hover:bg-white border border-transparent hover:border-gray-100">
          AI設定
        </Link>
        <span className="px-4 py-2 rounded-xl bg-white border border-gray-100 font-bold text-gray-900">SNS配信設定</span>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        記事詳細画面から手動で外部プラットフォームへ配信できます。プラットフォームごとにAPIクレデンシャルを設定し、有効化したものだけが配信対象になります。
      </p>

      <div className="space-y-4">
        {SNS_PLATFORMS.map((platform) => {
          const current = platformSettings[platform.id as keyof SnsPlatformSettings];
          return (
            <div key={platform.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900 text-sm">{platform.label}</h2>
                  {!platform.implemented && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">配信機能は今後対応予定</span>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={current?.enabled ?? false}
                    onChange={() => toggleEnabled(platform.id)}
                    className="w-4 h-4 text-red-600"
                  />
                  有効化
                </label>
              </div>
              <div className="space-y-2">
                {platform.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="password"
                      value={current?.credentials?.[field.key] ?? ""}
                      onChange={(e) => setCredential(platform.id, field.key, e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
