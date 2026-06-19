// 記事の種別・ステータスの表示用ラベル・アイコン・バッジスタイル
// DB上の article_type / article_status は多値だが、
// UI表示は「種別: 紹介・招待コード・関連」「ステータス: 公開中・審査待ち」に簡略化する

export function getArticleTypeLabel(type: string): string {
  if (type === "introduction") return "紹介";
  if (type === "invitation") return "招待";
  return "関連";
}

export function getArticleTypeIcon(type: string): string {
  if (type === "introduction") return "📄";
  if (type === "invitation") return "🎁";
  return "🔗";
}

export function getArticleTypeBadgeClass(type: string): string {
  if (type === "introduction") return "bg-brand-50 text-brand-700";
  if (type === "invitation") return "bg-green-50 text-green-700";
  return "bg-blue-50 text-blue-700";
}

export function getArticleStatusLabel(status: string): string {
  if (status === "published") return "公開中";
  if (status === "queued") return "公開待ち";
  return "審査待ち";
}

export function getArticleStatusBadgeClass(status: string): string {
  if (status === "published") return "bg-green-100 text-green-700";
  if (status === "queued") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
}
