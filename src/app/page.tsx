import Link from "next/link";
import { programs } from "@/data/programs";
import { articles } from "@/data/articles";
import ProgramCard from "@/components/ProgramCard";
import ArticleCard from "@/components/ArticleCard";

export default function Home() {
  const topPrograms = programs.slice(0, 4);
  const featuredArticles = articles.filter((a) => a.featured).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-red-200 text-sm font-medium uppercase tracking-widest mb-4">
              日本のポイ活をナビゲート
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              お得なポイントプログラムを
              <br />
              <span className="text-yellow-300">比較・選択・活用</span>しよう
            </h1>
            <p className="text-red-100 text-lg leading-relaxed mb-8 max-w-2xl">
              楽天・d・Ponta・Vポイントなど主要8サービスを徹底比較。
              あなたのライフスタイルに合った最強のポイ活戦略を見つけましょう。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/programs"
                className="bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                ポイント一覧を見る
              </Link>
              <Link
                href="/compare"
                className="bg-red-700 text-white font-bold px-6 py-3 rounded-xl border border-red-400 hover:bg-red-600 transition-colors"
              >
                比較ツールを使う
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-4">
              <p className="text-2xl font-black text-red-600">8</p>
              <p className="text-sm text-gray-500 mt-1">主要ポイントサービス</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-black text-red-600">6記事</p>
              <p className="text-sm text-gray-500 mt-1">ポイ活攻略ガイド</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-black text-red-600">無料</p>
              <p className="text-sm text-gray-500 mt-1">完全無料で利用可能</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-1">人気ランキング</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">おすすめポイントTOP4</h2>
          </div>
          <Link href="/programs" className="text-red-600 font-medium text-sm hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} showRank />
          ))}
        </div>
      </section>

      {/* How to start */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-1">始め方</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">ポイ活3ステップ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "ポイントを比較する",
                desc: "自分の生活スタイルに合ったポイントプログラムを比較・選択しましょう。",
                href: "/compare",
                linkText: "比較ツールへ",
              },
              {
                step: "02",
                title: "お得な情報を学ぶ",
                desc: "ポイント還元率アップのテクニックやキャンペーン情報を把握しましょう。",
                href: "/tips",
                linkText: "攻略記事へ",
              },
              {
                step: "03",
                title: "賢く貯めて使う",
                desc: "日常の買い物・支払いをポイントに変え、効率よく生活費を削減しましょう。",
                href: "/ranking",
                linkText: "ランキングへ",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-red-600">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                <Link href={item.href} className="text-red-600 font-medium text-sm hover:underline">
                  {item.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-1">お得情報</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">人気の攻略記事</h2>
          </div>
          <Link href="/tips" className="text-red-600 font-medium text-sm hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-4">
            どのポイントが自分に合う？
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            比較ツールで複数のポイントプログラムを並べて比較してみましょう。
          </p>
          <Link
            href="/compare"
            className="bg-red-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-700 transition-colors inline-block"
          >
            無料で比較してみる
          </Link>
        </div>
      </section>
    </div>
  );
}
