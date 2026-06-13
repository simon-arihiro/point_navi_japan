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

// HEXカラーに透明度を付けてrgba化する（淡い背景・枠線に使用）
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    <Link href={href} className="block h-full">
      <div
        className="relative bg-white rounded-2xl border-4 overflow-hidden h-full flex flex-col transition-transform duration-200 ease-out hover:scale-[1.04] hover:shadow-lg hover:z-10"
        style={{ borderColor: hexToRgba(bgColor, 0.35) }}
      >
        <div className="flex flex-col gap-2 flex-1">
          {/* ヘッダー行: サービスロゴ＋名前（金色バー・横幅いっぱい） */}
          <div className="flex items-center gap-2.5 bg-amber-400 px-3 py-2.5 w-full">
            <LogoFallback
              name={svc?.name ?? "?"}
              logoUrl={svc?.logo_url}
              logoStoragePath={svc?.logo_storage_path}
              officialUrl={svc?.official_url}
              size={36}
              className="bg-white shrink-0"
            />
            <span className="font-black text-base text-amber-950 truncate">{svc?.name}</span>
          </div>

          <div className="px-3 flex flex-col gap-2 flex-1">
          {/* 訴求文＋マスコット */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-black text-gray-900 text-xl leading-snug whitespace-nowrap">
              新規登録は<span style={{ color: bgColor }}>お得</span>！
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/mascot/library/${mascot}`} alt="" className="w-20 h-20 object-contain shrink-0" />
          </div>

          {bonusText && (
            <p className="text-base text-red-600 font-black leading-snug line-clamp-2">{bonusText}</p>
          )}

          {/* 紹介コード（一行表記） */}
          <div
            className="rounded-lg px-2.5 py-1.5 text-center"
            style={{ backgroundColor: hexToRgba(bgColor, 0.1) }}
          >
            {svc?.referral_code ? (
              <p className="text-xs font-bold text-gray-800 truncate">
                紹介コード <span className="text-gray-400">⇒</span>{" "}
                <span className="font-mono tracking-wider text-gray-900">{svc.referral_code}</span>
              </p>
            ) : (
              <p className="text-xs font-bold text-gray-700">招待リンクから登録でお得！</p>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2">
            {article.title}
          </h3>

          {publishedDate && <p className="text-[11px] text-gray-400 mt-auto pb-3">{publishedDate}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}
