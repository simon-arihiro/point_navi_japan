import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "ポイナビを運営する「りすくん」のプロフィールと、当サイトの編集方針についてご紹介します。",
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "りすくん",
      alternateName: "ポイナビ編集部",
      description:
        "日本在住、ポイ活・キャッシュレス決済・クレジットカードのポイント活用が好きな現役のポイ活実践者。ポイナビの運営者として、実際に使ったサービスのレビューを発信。",
      url: "https://jp-point-navi.com/about",
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-8">運営者情報</h1>

      <div className="flex items-center gap-4 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot/library/squirrel-greeting-wave-sparkle.png" alt="りすくん" className="w-24 h-24 object-contain shrink-0" />
        <div>
          <p className="text-xl font-black text-gray-900">りすくん</p>
          <p className="text-sm text-gray-500">「ポイナビ」運営者</p>
        </div>
      </div>

      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900">はじめまして、りすくんです</h2>
          <p>
            「ポイナビ」を運営している、りすくんです。日本でポイ活（ポイント活動）を始めてから数年、
            ポイントアプリやキャッシュレス決済、クレジットカードの招待コード・友達紹介キャンペーンなどを
            実際に自分で登録・利用しながら、お得な活用方法をコツコツ研究しています。
          </p>
          <p>
            「気になっているけど本当に使って大丈夫？」「招待コードって入力するだけで本当に特典がもらえるの？」
            ——そんな素朴な疑問に、実際に自分の手で試した体験をもとに、できるだけ正直にお答えすることを目指しています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">ポイナビについて</h2>
          <p>
            ポイナビは、日本のポイ活サービス・キャンペーン情報を比較・紹介するメディアです。
            掲載している記事は、公式サイトの情報をもとにしつつ、りすくん自身が実際にアプリを使ってみた感想や、
            登録時に気づいた注意点などを交えて執筆しています。
          </p>
          <ul>
            <li>実際に使ってみたサービスを中心に、メリット・デメリットを正直にレビュー</li>
            <li>招待コード・招待リンクの使い方や受け取り条件は、できるだけ最新の情報に更新</li>
            <li>キャンペーン内容は変更されることがあるため、最終確認は必ず公式サイトでお願いしています</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">編集方針</h2>
          <p>
            当サイトの記事は、紹介報酬（アフィリエイト）が発生する場合がありますが、
            報酬の有無によって評価を変えることはありません。良い点も気になる点も、
            実際に使って感じたことをそのまま伝えるようにしています。
          </p>
          <p>
            アフィリエイトプログラムについての詳細は
            <a href="/disclosure" className="text-brand-700 hover:underline">アフィリエイト収益開示</a>
            のページをご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">お問い合わせ</h2>
          <p>
            記事内容の誤りや、サービスに関する追加情報など、ご意見・ご指摘がありましたら
            <a href="/contact" className="text-brand-700 hover:underline">お問い合わせフォーム</a>
            より気軽にご連絡ください。
          </p>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
