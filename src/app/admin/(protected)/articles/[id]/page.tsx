"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import LogoFallback from "@/components/LogoFallback";
import { renderMarkdown, ARTICLE_PROSE_CLASS } from "@/lib/markdown";
import { getArticleTypeLabel, getArticleTypeIcon, getArticleStatusLabel, getArticleStatusBadgeClass } from "@/lib/articleTypes";
import { compressImage } from "@/lib/imageCompress";

export default function AdminArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingContent, setSavingContent] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleDelete = async () => {
    if (!confirm(`「${article.title}」をゴミ箱に移動しますか？ゴミ箱から復元することもできます。`)) return;
    setDeleting(true);
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/articles");
    } else {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  };

  const startEditing = () => {
    setEditTitle(article.title ?? "");
    setEditContent(article.content ?? "");
    setEditDescription(article.description ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveContent = async () => {
    setSavingContent(true);
    const res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent, description: editDescription }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setArticle({ ...article, ...data });
      setIsEditing(false);
    }
    setSavingContent(false);
  };

  // 本文編集欄に画像がペーストされたらStorageにアップロードし、Markdown形式でカーソル位置に挿入する
  const handleContentPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageFile = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .find((f): f is File => !!f);
    if (!imageFile) return;

    e.preventDefault();
    setUploadingImage(true);
    try {
      const compressed = await compressImage(imageFile);
      const res = await fetch(`/api/articles/${id}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: compressed.data, media_type: compressed.mediaType }),
      });
      if (res.ok) {
        const { url } = await res.json();
        const textarea = contentTextareaRef.current;
        const start = textarea?.selectionStart ?? editContent.length;
        const end = textarea?.selectionEnd ?? editContent.length;
        const insertion = `![画像](${url})`;
        setEditContent(editContent.slice(0, start) + insertion + editContent.slice(end));
        requestAnimationFrame(() => {
          if (!textarea) return;
          const pos = start + insertion.length;
          textarea.focus();
          textarea.setSelectionRange(pos, pos);
        });
      }
    } finally {
      setUploadingImage(false);
    }
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
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-bold rounded-full px-3 py-1 mb-1">
                  {getArticleTypeIcon(article.article_type)} {getArticleTypeLabel(article.article_type)}
                </span>
                {article.primary_service?.name && (
                  <p className="text-xs text-gray-500 truncate">{article.primary_service.name}</p>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  ✏️ 編集する
                </button>
              )}
            </div>

            {!isEditing ? (
              /* 本文プレビュー */
              <div
                className={`${ARTICLE_PROSE_CLASS} px-5 sm:px-8 py-6`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              />
            ) : (
              /* 手動編集フォーム */
              <div className="px-5 sm:px-8 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">タイトル</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SEO description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">本文（Markdown）</label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <textarea
                      ref={contentTextareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onPaste={handleContentPaste}
                      rows={24}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                    />
                    <div className={`${ARTICLE_PROSE_CLASS} border border-gray-100 rounded-xl px-4 py-3 overflow-y-auto max-h-[36rem]`}>
                      <p className="text-xs text-gray-400 mb-2">プレビュー</p>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {uploadingImage ? "画像をアップロード中..." : "画像をコピー&ペーストすると自動でアップロードされ、カーソル位置にMarkdown形式で挿入されます"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveContent}
                    disabled={savingContent}
                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {savingContent ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={savingContent}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
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
              <div><dt className="text-gray-500 text-xs">種別</dt><dd>{getArticleTypeIcon(article.article_type)} {getArticleTypeLabel(article.article_type)}</dd></div>
              <div><dt className="text-gray-500 text-xs">閲覧回数</dt><dd>{(article.view_count ?? 0).toLocaleString()} 回</dd></div>
              <div><dt className="text-gray-500 text-xs">AI書き直し回数</dt><dd>{article.revision_count ?? 0} 回</dd></div>
              <div><dt className="text-gray-500 text-xs">現在のステータス</dt>
                <dd>
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getArticleStatusBadgeClass(article.status)}`}>
                    {getArticleStatusLabel(article.status)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">ステータス変更</h2>
            <div className="space-y-2">
              <button
                onClick={() => updateStatus("published")}
                disabled={saving || article.status === "published"}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  article.status === "published"
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                ✓ 公開する
              </button>
              <button
                onClick={() => updateStatus("reviewing")}
                disabled={saving || article.status !== "published"}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  article.status !== "published"
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                審査待ちに戻す
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {deleting ? "移動中..." : "ゴミ箱に移動"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
