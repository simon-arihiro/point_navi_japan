import Link from "next/link";
import { Category } from "@/types/database";
import { ArticleWithService } from "@/types/database";
import Mascot from "@/components/Mascot";

type Props = {
  categories?: Category[];
  latestArticles?: ArticleWithService[];
};

export default function Footer({ categories = [], latestArticles = [] }: Props) {
  return (
    <footer className="bg-brand-900 text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mascot className="w-11 h-11" />
              <span className="text-white font-black text-2xl">
                ポイ<span className="text-brand-400">ナビ</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              日本のポイ活サービスを徹底ナビゲート。実際に使ってみた正直な感想をお届けします。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">カテゴリ一覧</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors">すべてのサービス</Link></li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/services/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">新着記事</h3>
            <ul className="space-y-2 text-sm">
              {latestArticles.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/articles/${(a.primary_service as any)?.categories?.[0]?.category?.slug ?? "all"}/${a.slug}`}
                    className="hover:text-white transition-colors line-clamp-1"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">サイト情報</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              <li><Link href="/disclosure" className="hover:text-white transition-colors">アフィリエイト収益開示</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-sm text-center">
          <p>© 2026 ポイナビ. All rights reserved.</p>
          <p className="mt-1 text-xs text-white/40">
            ※本サイトの情報は参考目的です。最新情報は各サービスの公式サイトをご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
