"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LogoFallback from "@/components/LogoFallback";
import { renderMarkdown, ARTICLE_PROSE_CLASS, placeImageAtTop } from "@/lib/markdown";
import { getArticleTypeLabel, getArticleTypeIcon, getArticleStatusLabel, getArticleStatusBadgeClass } from "@/lib/articleTypes";
import { compressImage } from "@/lib/imageCompress";
import { SNS_PLATFORMS } from "@/lib/sns/platforms";

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
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFeedback, setThumbnailFeedback] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [updatingRelated, setUpdatingRelated] = useState(false);
  const [feedbackImages, setFeedbackImages] = useState<{ dataUrl: string; data: string; mediaType: "image/jpeg" | "image/png" }[]>([]);
  const [enabledSnsPlatforms, setEnabledSnsPlatforms] = useState<string[]>([]);
  const [distributionLogs, setDistributionLogs] = useState<any[]>([]);
  const [distributing, setDistributing] = useState<string | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const feedbackImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then(({ data }) => { setArticle(data); setLoading(false); });
    fetch("/api/services")
      .then((r) => r.json())
      .then(({ data }) => setServices(data ?? []));
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ data }) => {
        const settings = data?.sns_platform_settings ?? {};
        setEnabledSnsPlatforms(Object.keys(settings).filter((p) => settings[p]?.enabled));
      });
    fetchDistributionLogs();
  }, [id]);

  const fetchDistributionLogs = () => {
    fetch(`/api/distribution/trigger?article_id=${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDistributionLogs(data ?? []));
  };

  const handleDistribute = async (platform: string) => {
    setDistributing(platform);
    try {
      await fetch("/api/distribution/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: id, platforms: [platform] }),
      });
      fetchDistributionLogs();
    } finally {
      setDistributing(null);
    }
  };

  // 比較記事などで関連付ける他サービスを更新する
  const updateRelatedServices = async (serviceIds: string[]) => {
    setUpdatingRelated(true);
    const res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ related_service_ids: serviceIds }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setArticle(data);
    }
    setUpdatingRelated(false);
  };

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
    const res = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article_id: id,
        feedback,
        images: feedbackImages.map((img) => ({ data: img.data, mediaType: img.mediaType })),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      alert(`AI書き直しに失敗しました: ${body?.error?.message ?? res.statusText}`);
      setRewriting(false);
      return;
    }
    // 再取得
    const res2 = await fetch(`/api/articles/${id}`);
    const { data } = await res2.json();
    setArticle(data);
    setFeedback("");
    setFeedbackImages([]);
    setRewriting(false);
  };

  // AIへの修正依頼に参考画像を添付する（スマホからはファイル選択でカメラ/アルバムから追加）
  const handleFeedbackImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const compressed = await Promise.all(files.map((file) => compressImage(file)));
    setFeedbackImages((prev) => [...prev, ...compressed]);
    if (feedbackImageInputRef.current) feedbackImageInputRef.current.value = "";
  };

  const removeFeedbackImage = (index: number) => {
    setFeedbackImages((prev) => prev.filter((_, i) => i !== index));
  };

  // PC等でテキストエリアに画像をペーストしたら参考画像として追加する
  const handleFeedbackPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => !!f);
    if (imageFiles.length === 0) return;

    e.preventDefault();
    const compressed = await Promise.all(imageFiles.map((file) => compressImage(file)));
    setFeedbackImages((prev) => [...prev, ...compressed]);
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

  // サムネイルをAI（Gemini）で再生成し、本文内の最初の画像も置き換える
  const handleGenerateThumbnail = async () => {
    setGeneratingThumbnail(true);
    try {
      const res = await fetch(`/api/articles/${id}/generate-thumbnail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: thumbnailFeedback }),
      });
      if (res.ok) {
        const { url, content } = await res.json();
        setArticle({ ...article, featured_image_url: url, content });
        if (isEditing) setEditContent(content);
      } else {
        const { error } = await res.json().catch(() => ({}));
        alert(error?.message ?? "サムネイル生成に失敗しました");
      }
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  // AI画像を手動でアップロードして差し替える（本文の最初の画像も置き換える）
  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const compressed = await compressImage(file);
      const uploadRes = await fetch(`/api/articles/${id}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: compressed.data, media_type: compressed.mediaType }),
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        const updatedContent = placeImageAtTop(article.content, article.title, url);
        await fetch(`/api/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured_image_url: url, content: updatedContent }),
        });
        setArticle({ ...article, featured_image_url: url, content: updatedContent });
        if (isEditing) setEditContent(updatedContent);
      }
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
    }
  };

  // AI画像の参照表示をクリアする（本文内の画像はそのまま残る）
  const handleClearThumbnail = async () => {
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured_image_url: null }),
    });
    setArticle({ ...article, featured_image_url: null });
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
              onPaste={handleFeedbackPaste}
              placeholder="修正したい点を記入してください。例: もっと口語的に、招待コードの案内をより自然に（画像をそのまま貼り付けることもできます）"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />

            {feedbackImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {feedbackImages.map((img, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeFeedbackImage(i)}
                      aria-label="画像を削除"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-gray-700 text-white rounded-full text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <input
                ref={feedbackImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFeedbackImageSelect}
                className="hidden"
                id="feedback-image-input"
              />
              <label
                htmlFor="feedback-image-input"
                className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                📷 参考画像を追加
              </label>
              <button
                onClick={handleRewrite}
                disabled={rewriting || !feedback.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {rewriting ? "書き直し中..." : "AIに書き直しを依頼"}
              </button>
            </div>
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
            <h2 className="font-bold text-gray-900 mb-1 text-sm">関連サービス</h2>
            <p className="text-xs text-gray-400 mb-3">比較記事などで他サービスを関連付けると、そのサービスの記事も「関連記事」に表示されやすくなります</p>
            <div className="space-y-2 mb-3">
              {(article.related_services ?? []).length === 0 ? (
                <p className="text-xs text-gray-400">未設定</p>
              ) : (
                article.related_services.map((rel: any) => (
                  <div key={rel.service.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                    <span className="truncate">{rel.service.name}</span>
                    <button
                      onClick={() => updateRelatedServices(
                        article.related_services.filter((r: any) => r.service.id !== rel.service.id).map((r: any) => r.service.id)
                      )}
                      disabled={updatingRelated}
                      className="text-gray-400 hover:text-red-600 text-xs ml-2 shrink-0 disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
            <select
              value=""
              disabled={updatingRelated}
              onChange={(e) => {
                if (!e.target.value) return;
                const currentIds = (article.related_services ?? []).map((r: any) => r.service.id);
                updateRelatedServices([...currentIds, e.target.value]);
              }}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <option value="">＋ サービスを追加...</option>
              {services
                .filter((s) => s.id !== article.primary_service_id)
                .filter((s) => !(article.related_services ?? []).some((r: any) => r.service.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">AI画像</h2>
            <p className="text-xs text-gray-400 mb-3">記事のサムネイルには本文内の最初の画像が使用されます。ここで生成・アップロードした画像は本文の最初に挿入されます</p>
            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden mb-3">
              {article.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.featured_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">未設定</div>
              )}
            </div>
            <textarea
              value={thumbnailFeedback}
              onChange={(e) => setThumbnailFeedback(e.target.value)}
              placeholder="画像の修正指示（任意）例: もっと明るい色合いで、リスのキャラクターを入れて"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="space-y-2">
              <button
                onClick={handleGenerateThumbnail}
                disabled={generatingThumbnail || uploadingThumbnail}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {generatingThumbnail ? "生成中..." : "🎨 AIで再生成"}
              </button>
              <button
                onClick={() => thumbnailFileInputRef.current?.click()}
                disabled={generatingThumbnail || uploadingThumbnail}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploadingThumbnail ? "アップロード中..." : "📁 画像をアップロード"}
              </button>
              <input
                ref={thumbnailFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailFileChange}
              />
              {article.featured_image_url && (
                <button
                  onClick={handleClearThumbnail}
                  disabled={generatingThumbnail || uploadingThumbnail}
                  className="w-full py-2 text-gray-400 text-xs hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  AI画像の表示をクリア
                </button>
              )}
            </div>
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
                ✓ 今すぐ公開する
              </button>
              <button
                onClick={() => updateStatus("queued")}
                disabled={saving || article.status === "queued" || article.status === "published"}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  article.status === "queued" || article.status === "published"
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                ⏱ 代発行待ちにする
              </button>
              <button
                onClick={() => updateStatus("reviewing")}
                disabled={saving || article.status === "reviewing"}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  article.status === "reviewing"
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                審査待ちに戻す
              </button>
              {article.status === "queued" && (
                <p className="text-xs text-gray-400 pt-1">
                  定時発行タイマーが発火すると、代発行待ちの記事から更新日時の古いものから順に自動公開されます。
                  <Link href="/admin/settings/publish-schedule" className="text-blue-600 hover:underline ml-1">タイマー設定を見る</Link>
                </p>
              )}
            </div>
          </div>

          {article.status === "published" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 text-sm">SNS配信</h2>
              {enabledSnsPlatforms.length === 0 ? (
                <p className="text-xs text-gray-400">
                  有効化されたプラットフォームがありません。
                  <br />
                  設定画面で有効化してください。
                </p>
              ) : (
                <div className="space-y-2">
                  {SNS_PLATFORMS.filter((p) => enabledSnsPlatforms.includes(p.id)).map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleDistribute(platform.id)}
                      disabled={distributing === platform.id}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {distributing === platform.id ? "配信中..." : `${platform.label} へ配信`}
                    </button>
                  ))}
                </div>
              )}
              {distributionLogs.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  {distributionLogs.map((log) => (
                    <div key={log.id} className="text-xs flex items-start justify-between gap-2">
                      <span className="text-gray-500">
                        {SNS_PLATFORMS.find((p) => p.id === log.platform)?.label ?? log.platform}
                      </span>
                      <span
                        className={
                          log.status === "success"
                            ? "text-green-600"
                            : log.status === "failed"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        {log.status === "success" ? "成功" : log.status === "failed" ? log.error_message ?? "失敗" : "処理中"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
