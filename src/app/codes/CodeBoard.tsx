"use client";

import { useState, useEffect, useCallback } from "react";
import LogoFallback from "@/components/LogoFallback";

type Service = {
  id: string;
  name: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  slug: string;
};

type Submission = {
  id: string;
  service_id: string;
  nickname: string;
  referral_code: string;
  comment: string | null;
  created_at: string;
  service: { name: string; logo_url: string | null; logo_storage_path: string | null } | null;
};

type Props = { services: Service[] };

export default function CodeBoard({ services }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterServiceId, setFilterServiceId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 投稿フォーム
  const [form, setForm] = useState({ service_id: "", nickname: "", referral_code: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const url = filterServiceId
      ? `/api/code-submissions?service_id=${filterServiceId}&limit=100`
      : "/api/code-submissions?limit=100";
    const res = await fetch(url);
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }, [filterServiceId]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const res = await fetch("/api/code-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error ?? "投稿に失敗しました");
    } else {
      setSubmitSuccess(true);
      setForm({ service_id: "", nickname: "", referral_code: "", comment: "" });
      fetchSubmissions();
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
    setSubmitting(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "たった今";
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return d.toLocaleDateString("ja-JP");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📋</span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">招待コード掲示板</h1>
        </div>
        <p className="text-gray-500 text-sm">
          みんなの招待コードをシェアしよう！気になるコードはコピーして登録に使えます。
        </p>
      </div>

      {/* 投稿フォーム */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
        <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
          <span>🎁</span> 招待コードを投稿する
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">サービス <span className="text-red-500">*</span></label>
              <select
                value={form.service_id}
                onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                required
              >
                <option value="">サービスを選択...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ニックネーム（任意）</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                placeholder="ななしの投稿者"
                maxLength={20}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">招待コード <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.referral_code}
              onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value }))}
              placeholder="招待コードを入力"
              maxLength={100}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">コメント（任意・200文字以内）</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="特典の詳細や使い方のコツなど..."
              maxLength={200}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              ⚠️ {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
              ✅ 投稿しました！ありがとうございます。
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </form>
      </div>

      {/* フィルター */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-black text-gray-900 text-lg">みんなの招待コード</h2>
        <select
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
          className="ml-auto border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="">すべてのサービス</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>まだ投稿がありません。最初に招待コードをシェアしよう！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {s.service && (
                    <LogoFallback
                      name={s.service.name}
                      logoUrl={s.service.logo_url}
                      logoStoragePath={s.service.logo_storage_path}
                      officialUrl={undefined}
                      size={32}
                      className="shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-brand-700 block truncate">{s.service?.name}</span>
                    <span className="text-xs text-gray-400">{s.nickname} · {formatDate(s.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-black text-red-600 text-sm tracking-wider">{s.referral_code}</span>
                  <button
                    onClick={() => handleCopy(s.id, s.referral_code)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    {copiedId === s.id ? "コピー済み" : "コピー"}
                  </button>
                </div>
              </div>
              {s.comment && (
                <p className="text-sm text-gray-600 mt-2 pl-10 leading-relaxed">{s.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-8 text-center">
        ※投稿された招待コードの有効性は保証できません。登録前に各サービスの公式サイトをご確認ください。
      </p>
    </div>
  );
}
