import Link from "next/link";
import { ArticleWithService } from "@/types/database";
import LogoFallback from "./LogoFallback";
import { getAutoColor } from "@/lib/autoColor";

type Props = {
  article: ArticleWithService;
  categorySlug?: string;
};

// カード内に表示するマスコット（ポジティブな表情のもののみ）。記事ごとにずらして変化を出す
const POSITIVE_MASCOTS = [
  "squirrel-celebration-jump-confetti-coins.png",
  "squirrel-celebration-jump-arms.png",
  "squirrel-trophy-coins-celebrate.png",
  "squirrel-happy-coins-cards.png",
  "squirrel-run-coin-excited.png",
  "squirrel-excited-run-sparkle.png",
  "squirrel-waving-happy-sparkle.png",
  "squirrel-trophy-stars-happy.png",
];

function pickMascot(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return POSITIVE_MASCOTS[hash % POSITIVE_MASCOTS.length];
}

// 招待コード一覧ページ用の統一テンプレートカード
// 色付きヘッダー（サービス名＋ロゴ）＋訴求文＋招待コード/リンク＋記事タイトル＋公開日 を同じレイアウトで表示する
export default function InvitationCard({ article, categorySlug }: Props) {
  const svc = article.primary_service as any;
  const cat = categorySlug ?? svc?.categories?.[0]?.category?.slug ?? "all";
  const href = `/articles/${cat}/${article.slug}`;
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("ja-JP")
    : "";
  const bgColor = svc ? getAutoColor(svc.name) : "#888888";

  const bonusAmountText = svc?.bonus_amount?.trim() || null;
  const bonusText =
    svc?.bonus_points && bonusAmountText
      ? `今すぐ登録で${svc.bonus_points.toLocaleString()}pt（約${bonusAmountText}円）もらえる！`
      : svc?.bonus_points
      ? `今すぐ登録で${svc.bonus_points.toLocaleString()}ptもらえる！`
      : bonusAmountText
      ? `今すぐ登録で約${bonusAmountText}円相当もらえる！`
      : svc?.campaign_bonus || null;

  const mascot = pickMascot(svc?.id ?? article.id);

  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all h-full flex flex-col relative">
        {/* 右上バッジ */}
        <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg z-10 flex items-center gap-1">
          <span className="text-[8px]">■</span>ポイントサイト紹介コード
        </div>

        <div className="p-4 pt-9" style={{ backgroundColor: bgColor }}>
          {/* サービスロゴ＋名前 */}
          <div className="flex items-center gap-2.5 mb-3">
            <LogoFallback
              name={svc?.name ?? "?"}
              logoUrl={svc?.logo_url}
              logoStoragePath={svc?.logo_storage_path}
              officialUrl={svc?.official_url}
              size={40}
              className="bg-white shrink-0"
            />
            <span className="text-white font-black text-lg truncate">{svc?.name}</span>
          </div>

          {/* 訴求文＋マスコット */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="font-black text-white text-2xl leading-tight">
              新規登録は<br />お得！
            </p>
            <div className="flex flex-col items-center gap-1 shrink-0 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/mascot/library/${mascot}`} alt="" className="w-16 h-16 object-contain" />
              {bonusText && (
                <p className="text-white text-[11px] text-center leading-snug font-bold">{bonusText}</p>
              )}
            </div>
          </div>

          {/* 紹介コード（一行表記） */}
          <div className="bg-white/95 rounded-lg px-3 py-2 text-center">
            {svc?.referral_code ? (
              <p className="text-sm font-bold text-gray-800">
                紹介コード <span className="text-gray-400">⇒</span>{" "}
                <span className="font-mono tracking-wider text-gray-900">{svc.referral_code}</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-700">招待リンクから登録でお得！</p>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {article.title}
          </h3>

          {publishedDate && <p className="text-xs text-gray-400 mt-auto">{publishedDate}</p>}
        </div>
      </div>
    </Link>
  );
}
