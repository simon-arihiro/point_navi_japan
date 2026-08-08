"use client";

import { useState, useEffect } from "react";

type Row = { keyword: string; count: number; page: string; last: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SearchInsightsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/search-no-results?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setRows(d.ranking ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">🔍 検索ニーズ分析</h1>
        <p className="text-sm text-gray-500 mt-1">結果が0件だった検索キーワード一覧。ユーザーが求めているコンテンツを把握できます。</p>
      </div>

      {/* 期間フィルター */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-bold text-gray-700">期間：</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              days === d ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {d}日間
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2">合計 {total} 件の検索</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">読み込み中...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">この期間に結果なし検索はありませんでした</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-bold text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">キーワード</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600">検索数</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">ページ</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">最終検索</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, i) => (
                <tr key={row.keyword} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{row.keyword}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      row.count >= 5 ? "bg-red-100 text-red-700" :
                      row.count >= 3 ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {row.count}回
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.page}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(row.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        ※ 赤色は5回以上、橙色は3回以上検索されたキーワードです。サービス追加・記事作成の参考にしてください。
      </p>
    </div>
  );
}
