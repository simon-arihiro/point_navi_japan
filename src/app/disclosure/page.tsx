import type { Metadata } from "next";

export const metadata: Metadata = { title: "アフィリエイト収益開示" };

export default function DisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-8">アフィリエイト収益開示</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <p>
          当サイトはアフィリエイトプログラムに参加しており、本ページではその開示を行います。
        </p>
        <h2 className="text-lg font-bold text-gray-900">参加しているプログラム</h2>
        <p>
          当サイトで紹介しているサービスの一部は、アフィリエイトリンク・招待リンクを含みます。
          これらのリンクを経由してユーザーが登録・利用した場合、当サイトは紹介報酬を受け取ることがあります。
        </p>
        <h2 className="text-lg font-bold text-gray-900">コンテンツの独立性</h2>
        <p>
          報酬の有無にかかわらず、記事の内容は運営者の実際の体験・見解に基づいており、
          アフィリエイト関係によって偏ることはありません。
        </p>
        <h2 className="text-lg font-bold text-gray-900">正直な情報提供</h2>
        <p>
          当サイトはユーザーにとって有益な情報提供を第一目的としています。
          気になる点があれば<a href="/contact" className="text-red-600 hover:underline">お問い合わせ</a>ください。
        </p>
      </div>
    </div>
  );
}
