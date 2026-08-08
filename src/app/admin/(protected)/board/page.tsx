"use client";

import { useState, useEffect } from "react";

type Submission = {
  id: string;
  service_id: string;
  nickname: string;
  referral_code: string;
  comment: string | null;
  created_at: string;
  ip_hash: string;
  service: { name: string } | null;
};

export default function BoardAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/board-submissions");
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    setDeletingId(id);
    await fetch(`/api/admin/board-submissions?id=${id}`, { method: "DELETE" });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("ja-JP");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">掲示板管理</h1>
        <p className="text-sm text-gray-500 mt-1">招待コード掲示板への投稿一覧。不適切な投稿を削除できます。</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">投稿がありません</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">サービス</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">ニックネーム</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">コメント</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">投稿日時</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">IP Hash</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-brand-700 whitespace-nowrap">
                    {s.service?.name ?? "不明"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{s.nickname}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="truncate">{s.comment || s.referral_code || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.ip_hash.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-40 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      {deletingId === s.id ? "削除中..." : "削除"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
