"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LogoFallback from "@/components/LogoFallback";

type Service = {
  id: string;
  name: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  slug: string;
  description?: string | null;
};

type Submission = {
  id: string;
  service_id: string;
  nickname: string;
  referral_code: string;
  comment: string | null;
  created_at: string;
  service: { name: string; logo_url: string | null; logo_storage_path: string | null; slug: string } | null;
};

type Props = {
  service?: Service;
  services?: Service[];
  searchQuery?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `${days}日まえ`;
  return d.toLocaleDateString("ja-JP");
}

// IDっぽい短縮文字列（表示用）
function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8);
}

export default function CodeBoard({ service, searchQuery }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nickname: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "10" });
    if (service?.id) params.set("service_id", service.id);
    if (searchQuery) params.set("keyword", searchQuery);
    const res = await fetch(`/api/code-submissions?${params}`);
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }, [service?.id, searchQuery]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const res = await fetch("/api/code-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: service.id, ...form }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitError(data.error ?? "投稿に失敗しました");
    } else {
      setSubmitSuccess(true);
      setForm({ nickname: "", comment: "" });
      fetchSubmissions();
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
    setSubmitting(false);
  };

  const isServicePage = !!service;
  const commentCount = submissions.length;

  return (
    <div className="space-y-5">
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
              {isServicePage
                ? `${service.name} 招待コード掲示板`
                : searchQuery
                ? `「${searchQuery}」の検索結果`
                : "招待コード掲示板"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isServicePage
                ? `${service.name}の招待コードを投稿・検索できる掲示板です。ポイント獲得やフレンド募集に活用できます。`
                : "みんなの招待コードをシェアしよう！気になるコードはコピーして登録に使えます。"}
            </p>
          </div>
        </div>
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
              {`【招待コード】\n〇〇\n\n【ひとこと】\n〇〇`}
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 leading-relaxed">
              【ご利用にあたって】<br />
              この掲示板は公式とは関係のない、ユーザー同士の情報共有の場です。掲載されている招待コードの利用は、各自の判断と責任でお願いいたします。万がトラブルや不利益が発生した場合でも、当サイトでは責任を負いかねますのでご了承ください。
            </div>
          </div>
        </div>
      )}

      {/* 投稿フォーム（サービスページのみ） */}
      {isServicePage && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700">コメントを投稿</div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 名前 */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700 w-10 shrink-0">名前</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder="ななしの投稿者"
                  maxLength={20}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              {/* コメント */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700">
                    コメント <span className="text-red-500 text-xs">※必須</span>
                  </label>
                  <span className="text-xs text-gray-400">残り {500 - form.comment.length} 文字</span>
                </div>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder={`コメント内容（最大500文字）\n例）【招待コード】ABCD1234\n良かったら使ってください！`}
                  maxLength={500}
                  rows={4}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">⚠️ {submitError}</div>
              )}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">✅ 投稿しました！ありがとうございます。</div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white font-bold px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {submitting ? "投稿中..." : "投稿する"}
                </button>
                <span className="text-xs text-gray-400">利用規約に同意の上、投稿してください</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 投稿一覧 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-700 text-white text-sm font-bold px-4 py-2.5 flex items-center gap-4">
          <span>
            {isServicePage ? `コメント (${service.name})` : "コメント一覧"}
          </span>
          <span className="text-xs font-normal opacity-75">💬 {commentCount}件</span>
          <span className="text-xs font-normal opacity-60 ml-auto">新しい順</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">
              {searchQuery ? "検索結果が見つかりませんでした。" : "まだ投稿がありません。最初に招待コードをシェアしよう！"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {submissions.map((s, i) => (
              <li key={s.id} className="px-4 py-4">
                {/* ヘッダー行: 番号 + ニックネーム + 日時 + ID */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 font-mono w-6">{commentCount - i}</span>
                  <span className="text-sm font-bold text-gray-800">{s.nickname}</span>
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(s.created_at)}</span>
                  <span className="text-xs text-gray-300 font-mono">ID : {shortId(s.id)}</span>
                </div>
                {/* サービス名（トップページ・検索結果のみ） — クリックでサービス掲示板へ */}
                {!isServicePage && s.service && (
                  <Link
                    href={`/codes/${s.service.slug}`}
                    className="flex items-center gap-1.5 mb-2 ml-8 w-fit hover:opacity-75 transition-opacity"
                  >
                    <LogoFallback
                      name={s.service.name}
                      logoUrl={s.service.logo_url}
                      logoStoragePath={s.service.logo_storage_path}
                      officialUrl={undefined}
                      size={16}
                      className="shrink-0"
                    />
                    <span className="text-xs font-bold text-brand-700 underline underline-offset-2">{s.service.name}</span>
                  </Link>
                )}
                {/* コメント本文 */}
                <p className="text-sm text-gray-700 ml-8 leading-relaxed whitespace-pre-wrap">
                  {s.comment || s.referral_code}
                </p>
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
