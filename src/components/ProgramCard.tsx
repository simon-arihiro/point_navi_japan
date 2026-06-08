import Link from "next/link";
import { PointProgram } from "@/data/programs";

type Props = {
  program: PointProgram;
  showRank?: boolean;
};

export default function ProgramCard({ program, showRank = false }: Props) {
  return (
    <Link href={`/programs/${program.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 h-full">
        <div className="h-2" style={{ backgroundColor: program.color }} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {showRank && (
                <span className="text-2xl font-black text-gray-200">#{program.rank}</span>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                style={{ backgroundColor: program.color, color: program.textColor }}
              >
                {program.name[0]}
              </div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1">
              {program.categories[0]}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-red-600 transition-colors">
            {program.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{program.company}</p>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
            {program.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">基本還元率</p>
              <p className="font-bold text-gray-900">{program.pointRate}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">主な利用先</p>
              <p className="font-bold text-gray-900 truncate">{program.mainUseCase.split("・")[0]}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {program.appAvailable && (
              <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">アプリあり</span>
            )}
            {program.exchangeable && (
              <span className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5">交換可能</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
