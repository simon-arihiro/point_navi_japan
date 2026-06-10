"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import LogoFallback from "@/components/LogoFallback";
import { renderMarkdown, ARTICLE_PROSE_CLASS } from "@/lib/markdown";

const STATUS_OPTIONS = ["reviewing", "published", "rejected", "archived"] as const;
const STATUS_LABEL: Record<string, string> = {
  reviewing: "審査待ちに戻す",
  published: "✓ 公開する",
  rejected: "✕ 却下する",
  archived: "アーカイブ",
};

const TYPE_LABEL: Record<string, string> = {
  introduction: "サービス紹介",
  guide: "使い方ガイド",
  faq: "よくある質問",
  comparison: "比較",
  campaign: "キャンペーン",
  earnings: "収益実績",
};

const TYPE_ICON: Record<string, string> = {
  introduction: "📄",
  guide: "📖",
  faq: "❓",
  comparison: "⚖️",
  campaign: "🎉",
  earnings: "💰",
};

export default function AdminArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rewriting, setRewriting] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, [id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setArticle((prev: any) => ({ ...prev, status }));
    setSaving(false);
  };

  const handleRewrite = async () => {
    if (!feedback.trim()) return;
    setRewriting(true);
    await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: id, feedback }),
    });
    // 再取得
    const res = await fetch(`/api/articles/${id}`);
    const { data } = await res.json();
    setArticle(data);
    setFeedback("");
    setRewriting(false);
  };

  if (loading) return <div className="text-gray-400 text-sm">読み込み中...</div>;
  if (!article) return <div className="text-red-600 text-sm">記事が見つかりません</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 shrink-0">← 戻る</button>
        <h1 className="text-lg sm:text-xl font-black text-gray-900 flex-1 truncate">{article.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 記事本文 */}
        <div className="lg:col-span-2 space-y-5">
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* サービス情報ヘッダー */}
            <div className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center gap-4">
              <LogoFallback
                name={article.primary_service?.name ?? "?"}
                logoUrl={article.primary_service?.logo_url}
                logoStoragePath={article.primary_service?.logo_storage_path}
                officialUrl={article.primary_service?.official_url}
                size={48}
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-bold rounded-full px-3 py-1 mb-1">
                  {TYPE_ICON[article.article_type] ?? "📝"} {TYPE_LABEL[article.article_type] ?? article.article_type}
                </span>
                {article.primary_service?.name && (
                  <p className="text-xs text-gray-500 truncate">{article.primary_service.name}</p>
                )}
              </div>
            </div>

            {/* 本文プレビュー */}
            <div
              className={`${ARTICLE_PROSE_CLASS} px-5 sm:px-8 py-6`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
            />
          </article>

          {/* フィードバックで書き直し */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">AIに書き直しを依頼</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="修正したい点を記入してください。例: もっと口語的に、招待コードの案内をより自然に"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <button
              onClick={handleRewrite}
              disabled={rewriting || !feedback.trim()}
              className="mt-3 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {rewriting ? "書き直し中..." : "AIに書き直しを依頼"}
            </button>
          </div>
        </div>

        {/* 操作パネル */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">記事情報</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500 text-xs">サービス</dt><dd className="font-medium">{article.primary_service?.name ?? "—"}</dd></div>
              <div><dt className="text-gray-500 text-xs">種別</dt><dd>{TYPE_ICON[article.article_type] ?? "📝"} {TYPE_LABEL[article.article_type] ?? article.article_type}</dd></div>
              <div><dt className="text-gray-500 text-xs">AI書き直し回数</dt><dd>{article.revision_count ?? 0} 回</dd></div>
              <div><dt className="text-gray-500 text-xs">現在のステータス</dt>
                <dd>
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    article.status === "published" ? "bg-green-100 text-green-700" :
                    article.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {article.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">ステータス変更</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={saving || article.status === s}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    article.status === s
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : s === "published"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : s === "rejected"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {STATUS_LABEL[s] ?? s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
