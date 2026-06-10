// 記事の種別・ステータスの表示用ラベル・アイコン・バッジスタイル
// DB上の article_type / article_status は多値だが、
// UI表示は「種別: 紹介・関連」「ステータス: 公開中・審査待ち」の2値に簡略化する

export function getArticleTypeLabel(type: string): string {
  return type === "introduction" ? "紹介" : "関連";
}

export function getArticleTypeIcon(type: string): string {
  return type === "introduction" ? "📄" : "🔗";
}

export function getArticleTypeBadgeClass(type: string): string {
  return type === "introduction" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
}

export function getArticleStatusLabel(status: string): string {
  return status === "published" ? "公開中" : "審査待ち";
}

export function getArticleStatusBadgeClass(status: string): string {
  return status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
}
