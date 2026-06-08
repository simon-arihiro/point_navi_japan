import { articles } from "@/data/articles";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

const articleContent: Record<string, string[]> = {
  "beginner-guide": [
    "ポイ活（ポイント活動）とは、日常の買い物や支払いでポイントを貯め、それを現金や商品・サービスと交換することでお得に生活する活動です。",
    "まず最初にやるべきことは、自分がよく使うお店やサービスに対応したポイントカードを作ることです。コンビニに毎日行くならnanacoやPontaポイント、楽天市場をよく使うなら楽天ポイント、という具合に自分のライフスタイルに合わせて選びましょう。",
    "次に重要なのが、クレジットカードの活用です。現金払いよりもクレジットカード払いにするだけで、買い物金額の1〜3%がポイントとして還元されます。年会費無料のカードから始めてみましょう。",
    "ポイントサイトの活用も効果的です。ハピタスやモッピーなどのポイントサイトを経由してネット通販をすると、通常のポイントに加えてさらにポイントが貯まります。これを「ポイントの二重取り」と呼びます。",
    "初心者が陥りがちな失敗は、ポイントのために無駄な買い物をしてしまうことです。あくまで「いつも買うものをよりお得に」という意識を忘れないようにしましょう。",
  ],
  "credit-card-strategy": [
    "クレジットカードはポイ活の核心です。適切なカードを選ぶことで、年間数万円分のポイントを獲得できます。",
    "還元率1%以上のカードを選ぶことが基本です。楽天カード（1%）、dカード（1%）、三井住友カード（0.5〜最大5%）などが代表例です。",
    "年会費との兼ね合いも重要です。年会費1万円でも、年間50万円以上使うなら年会費以上のポイントが得られることもあります。まずは年会費無料のカードから始めましょう。",
    "カードを複数持ち、店舗によって使い分けることで還元率を最大化できます。例えばコンビニはdカード、楽天市場は楽天カード、という使い分けが効果的です。",
  ],
  "convenience-store-tips": [
    "コンビニは毎日利用する人も多く、ポイントの積み上げに最適な場所です。",
    "セブンイレブンではnanacoが最強です。公共料金や税金の支払いにも使えるため、nanacoカードとクレジットカードのチャージを組み合わせることでポイントの二重取りができます。",
    "ローソンではPontaポイントとdポイントの両方が使えます。毎月10日・20日はお得なキャンペーンが多いので要チェックです。",
    "ファミリーマートではTカード（Vポイント）が使えます。Tポイント加盟のファミマTカードを使えばさらにお得です。",
  ],
  "rakuten-ecosystem": [
    "楽天SPU（スーパーポイントアッププログラム）は、楽天グループのサービスを利用するほどポイント倍率が上がる仕組みです。",
    "楽天カードを使うだけで+2倍、楽天銀行の引き落としで+1倍、楽天証券で投資信託を買うと+1倍…というように、各サービスの条件を満たすことで最大16倍まで倍率が上がります。",
    "まず楽天カードを作り、楽天市場での支払いに使うことから始めましょう。それだけで基本3%の還元が得られます。",
    "楽天銀行口座を開設して楽天カードの引き落とし口座に設定することで、さらに+1倍になります。預金の金利もアップするので一石二鳥です。",
    "楽天ゴールドカードや楽天プレミアムカードへのアップグレードも、ポイントが多い人には有効な選択肢です。",
  ],
  "point-exchange": [
    "貯めたポイントは交換先によって価値が変わります。最も損しない使い方を知っておきましょう。",
    "一般的にポイントを現金として使うのが最も損をしない方法ですが、マイルに交換することで価値が数倍になることもあります。",
    "例えば楽天ポイントはANAマイルに交換でき、1ポイント→0.5マイルのレートですが、マイルを国際線に使うと1マイル=3〜5円の価値になることがあります。",
    "ポイントの有効期限に注意しましょう。期限が近づいているポイントはすぐに使えるものから使っていきましょう。有効期限が延長される条件（利用・交換など）も確認しておきましょう。",
  ],
  "online-shopping-tricks": [
    "ポイントサイトとは、特定の広告主（ショッピングサイトや金融商品など）を紹介することでポイントを得られるサービスです。",
    "ハピタス・モッピー・げん玉・ポイントインカムなどが代表的です。これらのサイトを経由してネット通販をするだけで、通常の買い物ポイントに加えてさらにポイントが貯まります。",
    "例えば楽天市場をハピタス経由で使うと、楽天ポイント+ハピタスポイントの二重取りができます。さらに楽天カードで支払えば三重取りも可能です。",
    "ポイントサイトのポイントは現金や他のポイントに交換できます。まずは1〜2つのポイントサイトに登録して使い方を覚えましょう。",
  ],
};

export default async function TipsDetailPage({ params }: Props) {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);

  if (!article) notFound();

  const content = articleContent[id] ?? ["この記事のコンテンツは準備中です。"];
  const relatedArticles = articles.filter((a) => a.id !== id).slice(0, 3);

  const formattedDate = new Date(article.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-red-600">ホーム</Link>
            <span>/</span>
            <Link href="/tips" className="hover:text-red-600">お得情報</Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs bg-red-50 text-red-600 font-medium rounded-full px-3 py-1">
                {article.category}
              </span>
              <span className="text-xs text-gray-400">{article.readTime}分で読める</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-sm text-gray-500">
              <span>{formattedDate}</span>
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 rounded px-2 py-0.5 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Lead */}
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-8">
              <p className="text-gray-700 leading-relaxed">{article.excerpt}</p>
            </div>

            {/* Content paragraphs */}
            <div className="space-y-5">
              {content.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                ※本記事の情報は参考目的です。最新情報は各サービスの公式サイトをご確認ください。
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">関連記事</h3>
              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/tips/${rel.id}`}
                    className="block hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors group"
                  >
                    <span className="text-xs text-red-500 font-medium">{rel.category}</span>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors leading-snug mt-0.5 line-clamp-2">
                      {rel.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-2xl p-6">
              <h3 className="font-bold mb-2">ポイントを比較する</h3>
              <p className="text-sm text-gray-400 mb-4">
                あなたに合ったポイントプログラムを比較ツールで探しましょう
              </p>
              <Link
                href="/compare"
                className="block w-full text-center bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                比較ツールへ
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
