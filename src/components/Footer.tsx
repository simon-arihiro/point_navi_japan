import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-white font-bold text-lg">
                ポイントナビ<span className="text-red-500">Japan</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              日本のポイ活を徹底ナビゲート。お得なポイントプログラムの比較・解説サイトです。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">ポイント情報</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/programs" className="hover:text-white transition-colors">ポイント一覧</Link></li>
              <li><Link href="/ranking" className="hover:text-white transition-colors">ランキング</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">比較ツール</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">お得情報</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tips" className="hover:text-white transition-colors">攻略記事</Link></li>
              <li><Link href="/tips?category=入門" className="hover:text-white transition-colors">初心者ガイド</Link></li>
              <li><Link href="/tips?category=クレジットカード" className="hover:text-white transition-colors">クレカ活用</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">サイト情報</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">このサイトについて</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">免責事項</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center">
          <p>© 2026 ポイントナビJapan. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-600">
            ※本サイトの情報は参考目的です。最新情報は各サービスの公式サイトをご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
