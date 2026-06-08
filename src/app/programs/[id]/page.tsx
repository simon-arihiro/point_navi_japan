import { programs } from "@/data/programs";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return programs.map((p) => ({ id: p.id }));
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params;
  const program = programs.find((p) => p.id === id);

  if (!program) notFound();

  const otherPrograms = programs.filter((p) => p.id !== id).slice(0, 3);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-red-600">ホーム</Link>
            <span>/</span>
            <Link href="/programs" className="hover:text-red-600">ポイント一覧</Link>
            <span>/</span>
            <span className="text-gray-900">{program.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero section */}
      <div className="text-white" style={{ backgroundColor: program.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black bg-white/20"
            >
              {program.name[0]}
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">{program.company}</p>
              <h1 className="text-3xl md:text-4xl font-black">{program.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {program.categories.map((cat) => (
                  <span key={cat} className="text-xs bg-white/20 rounded-full px-3 py-1">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">概要</h2>
              <p className="text-gray-600 leading-relaxed">{program.description}</p>
            </div>

            {/* Key stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { label: "基本還元率", value: `${program.pointRate}%（100円=1ポイント）` },
                  { label: "最低利用ポイント", value: `${program.minRedemption}ポイント〜` },
                  { label: "有効期限", value: program.expiry },
                  { label: "ユーザー数", value: program.usersCount },
                  { label: "主な利用先", value: program.mainUseCase },
                  { label: "アプリ", value: program.appAvailable ? "あり" : "なし" },
                  { label: "ポイント交換", value: program.exchangeable ? "可能" : "不可" },
                ].map((item) => (
                  <div key={item.label} className="col-span-1">
                    <dt className="text-xs text-gray-500 mb-1">{item.label}</dt>
                    <dd className="text-sm font-semibold text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h2 className="text-base font-bold text-green-800 mb-3 flex items-center gap-2">
                  <span>✓</span> メリット
                </h2>
                <ul className="space-y-2">
                  {program.pros.map((pro) => (
                    <li key={pro} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h2 className="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                  <span>✗</span> デメリット
                </h2>
                <ul className="space-y-2">
                  {program.cons.map((con) => (
                    <li key={con} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rank badge */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">人気ランキング</p>
              <p className="text-5xl font-black" style={{ color: program.color }}>
                #{program.rank}
              </p>
              <p className="text-sm text-gray-600 mt-2">全{programs.length}サービス中</p>
            </div>

            {/* Compare CTA */}
            <div className="bg-gray-900 text-white rounded-2xl p-6">
              <h3 className="font-bold mb-2">他のポイントと比較</h3>
              <p className="text-sm text-gray-400 mb-4">
                比較ツールで{program.name}と他のサービスを並べて確認できます
              </p>
              <Link
                href="/compare"
                className="block w-full text-center bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                比較ツールへ
              </Link>
            </div>

            {/* Other programs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">他のポイントを見る</h3>
              <div className="space-y-3">
                {otherPrograms.map((other) => (
                  <Link
                    key={other.id}
                    href={`/programs/${other.id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: other.color, color: other.textColor }}
                    >
                      {other.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{other.name}</p>
                      <p className="text-xs text-gray-500">#{other.rank}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
