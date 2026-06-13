import Link from "next/link";
import { ArticleWithService } from "@/types/database";
import LogoFallback, { getAutoColor } from "./LogoFallback";

type Props = {
  article: ArticleWithService;
  categorySlug?: string;
};

// 招待コード一覧ページ用の統一テンプレートカード
// 色付きヘッダー（サービス名）＋特典の一言＋招待コード/リンク＋記事タイトル＋公開日 を同じレイアウトで表示する
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

  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: bgColor }}>
          <LogoFallback
            name={svc?.name ?? "?"}
            logoUrl={svc?.logo_url}
            logoStoragePath={svc?.logo_storage_path}
            officialUrl={svc?.official_url}
            size={28}
            className="bg-white shrink-0"
          />
          <span className="text-white font-black text-sm truncate flex-1">{svc?.name}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/library/squirrel-recommend-point-bubble.png" alt="" className="w-9 h-9 shrink-0" />
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          {bonusText && (
            <p className="text-center font-black text-brand-600 text-base leading-snug">{bonusText}</p>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
            {svc?.referral_code ? (
              <>
                <p className="text-xs text-gray-500 mb-1">紹介コード</p>
                <p className="font-mono font-bold text-lg tracking-widest text-gray-900">{svc.referral_code}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-700">招待リンクから登録でお得！</p>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {article.title}
          </h3>

          {publishedDate && <p className="text-xs text-gray-400 mt-auto">{publishedDate}</p>}
        </div>
      </div>
    </Link>
  );
}
