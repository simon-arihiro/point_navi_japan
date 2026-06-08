import { programs } from "@/data/programs";
import Link from "next/link";

export default function RankingPage() {
  const ranked = [...programs].sort((a, b) => a.rank - b.rank);

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">ポイントプログラムランキング</h1>
          <p className="text-gray-600">人気・使いやすさ・還元率を総合評価したランキングです</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[ranked[1], ranked[0], ranked[2]].map((program, podiumIndex) => {
            const positions = [2, 1, 3];
            const pos = positions[podiumIndex];
            const heights = ["h-28", "h-36", "h-24"];
            return (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="flex flex-col items-center group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-2 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: program.color, color: program.textColor }}
                >
                  {program.name[0]}
                </div>
                <p className="text-sm font-bold text-gray-900 text-center mb-2 group-hover:text-red-600 transition-colors">
                  {program.name}
                </p>
                <div
                  className={`w-full ${heights[podiumIndex]} rounded-t-xl flex items-start justify-center pt-2`}
                  style={{ backgroundColor: program.color + "22" }}
                >
                  <span className="text-2xl font-black" style={{ color: program.color }}>
                    #{pos}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Full ranking list */}
        <div className="space-y-3">
          {ranked.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="flex items-center gap-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              {/* Rank number */}
              <div className="w-10 text-center">
                <span
                  className={`text-xl font-black ${
                    program.rank === 1
                      ? "text-yellow-500"
                      : program.rank === 2
                      ? "text-gray-400"
                      : program.rank === 3
                      ? "text-amber-600"
                      : "text-gray-300"
                  }`}
                >
                  #{program.rank}
                </span>
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                style={{ backgroundColor: program.color, color: program.textColor }}
              >
                {program.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {program.name}
                  </p>
                  <span className="text-xs text-gray-400">{program.company}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{program.mainUseCase}</p>
              </div>

              {/* Stats */}
              <div className="hidden sm:grid grid-cols-2 gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-500">還元率</p>
                  <p className="font-bold text-gray-900">{program.pointRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ユーザー数</p>
                  <p className="font-bold text-gray-900 text-sm">{program.usersCount}</p>
                </div>
              </div>

              <svg
                className="w-5 h-5 text-gray-300 group-hover:text-red-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <p className="text-xs text-center text-gray-400 mt-8">
          ※ランキングは編集部による総合評価です。最新情報は各公式サイトをご確認ください。
        </p>
      </div>
    </div>
  );
}
