"use client";

import { useState, useEffect, useCallback } from "react";
import LogoFallback from "@/components/LogoFallback";

type Service = {
  id: string;
  name: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  slug: string;
  referral_code?: string | null;
  description?: string | null;
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

type Props = {
  /** 特定サービスページ用 */
  service?: Service;
  /** トップページ用: 全サービス一覧（フィルタ用） */
  services?: Service[];
  /** 検索キーワード */
  searchQuery?: string;
};

export default function CodeBoard({ service, services = [], searchQuery }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 投稿フォーム（サービスページのみ）
  const [form, setForm] = useState({
    service_id: service?.id ?? "",
    nickname: "",
    referral_code: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (service?.id) params.set("service_id", service.id);
    if (searchQuery) params.set("keyword", searchQuery);
    const res = await fetch(`/api/code-submissions?${params}`);
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }, [service?.id, searchQuery]);

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
      setForm({ service_id: service?.id ?? "", nickname: "", referral_code: "", comment: "" });
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

  const isServicePage = !!service;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-1">
          {isServicePage && (
            <LogoFallback
              name={service.name}
              logoUrl={service.logo_url}
              logoStoragePath={service.logo_storage_path}
              officialUrl={undefined}
              size={40}
              className="shrink-0"
            />
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {isServicePage ? `${service.name} 招待コード掲示板` : searchQuery ? `「${searchQuery}」の検索結果` : "招待コード掲示板"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isServicePage
                ? `${service.name}の招待コードを投稿・検索できる掲示板です。ポイント獲得やフレンド募集に活用できます。`
                : "みんなの招待コードをシェアしよう！気になるコードはコピーして登録に使えます。"}
            </p>
          </div>
        </div>

        {/* サービス説明（サービスページのみ） */}
        {isServicePage && service.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
            {service.description}
          </p>
        )}
      </div>

      {/* 投稿テンプレート（サービスページのみ） */}
      {isServicePage && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700">招待コード募集テンプレ</div>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-2">コメント欄に招待コードを記載願います。</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
              {`【招待コード】
〇〇

【ひとこと】
〇〇`}
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              【ご利用にあたって】<br />
              この掲示板は公式とは関係のない、ユーザー同士の情報共有の場です。掲載されている招待コードの利用は、各自の判断と責任でお願いいたします。万がトラブルや不利益が発生した場合でも、当サイトでは責任を負いかねますのでご了承ください。
            </div>
          </div>
        </div>
      )}

      {/* 投稿フォーム（サービスページのみ） */}
      {isServicePage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="font-black text-gray-900 text-base mb-4 flex items-center gap-2">
            <span>🎁</span> 招待コードを投稿する
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ニックネーム（任意）</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder="ななしの投稿者"
                  maxLength={20}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                />
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">コメント（任意・200文字以内）</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="特典の詳細や使い方のコツなど..."
                maxLength={200}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none bg-white"
              />
            </div>
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">⚠️ {submitError}</div>
            )}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">✅ 投稿しました！ありがとうございます。</div>
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
      )}

      {/* 投稿一覧 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5 flex items-center justify-between">
          <span>コメント ({submissions.length})</span>
          <span className="text-xs font-normal opacity-75">新しい順</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">
              {searchQuery ? "検索結果が見つかりませんでした。" : "まだ投稿がありません。最初に招待コードをシェアしよう！"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {submissions.map((s) => (
              <li key={s.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {!isServicePage && s.service && (
                      <LogoFallback
                        name={s.service.name}
                        logoUrl={s.service.logo_url}
                        logoStoragePath={s.service.logo_storage_path}
                        officialUrl={undefined}
                        size={24}
                        className="shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      {!isServicePage && (
                        <span className="text-xs font-bold text-brand-700 block truncate">{s.service?.name}</span>
                      )}
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
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        ※投稿された招待コードの有効性は保証できません。登録前に各サービスの公式サイトをご確認ください。
      </p>
    </div>
  );
}
