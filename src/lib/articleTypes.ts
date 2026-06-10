// 記事種別の表示ラベル・絵文字アイコン
// ArticleCard / 記事一覧 / admin記事審査画面で共通利用する

export const ARTICLE_TYPE_LABEL: Record<string, string> = {
  introduction: "サービス紹介",
  guide: "使い方ガイド",
  faq: "よくある質問",
  comparison: "比較",
  campaign: "キャンペーン",
  earnings: "収益実績",
};

export const ARTICLE_TYPE_ICON: Record<string, string> = {
  introduction: "📄",
  guide: "📖",
  faq: "❓",
  comparison: "⚖️",
  campaign: "🎉",
  earnings: "💰",
};
