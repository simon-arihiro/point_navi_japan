"use client";

import { useState } from "react";
import { programs, PointProgram } from "@/data/programs";

const COMPARE_FIELDS = [
  { label: "基本還元率", key: "pointRate" as keyof PointProgram, format: (v: unknown) => `${v}%` },
  { label: "有効期限", key: "expiry" as keyof PointProgram, format: (v: unknown) => String(v) },
  { label: "主な利用先", key: "mainUseCase" as keyof PointProgram, format: (v: unknown) => String(v) },
  { label: "ユーザー数", key: "usersCount" as keyof PointProgram, format: (v: unknown) => String(v) },
  { label: "アプリ", key: "appAvailable" as keyof PointProgram, format: (v: unknown) => (v ? "あり ✓" : "なし") },
  { label: "ポイント交換", key: "exchangeable" as keyof PointProgram, format: (v: unknown) => (v ? "可能 ✓" : "不可") },
];

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleProgram = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const selectedPrograms = programs.filter((p) => selected.includes(p.id));

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">ポイント比較ツール</h1>
          <p className="text-gray-600">最大4つのポイントプログラムを並べて比較できます</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Program selector */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            比較するポイントを選択（最大4つ）
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {programs.map((program) => {
              const isSelected = selected.includes(program.id);
              const isDisabled = !isSelected && selected.length >= 4;
              return (
                <button
                  key={program.id}
                  onClick={() => toggleProgram(program.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-red-500 bg-red-50"
                      : isDisabled
                      ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-red-300"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: program.color, color: program.textColor }}
                  >
                    {program.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{program.name}</p>
                    {isSelected && (
                      <p className="text-xs text-red-600 font-medium">選択中</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison table */}
        {selectedPrograms.length < 2 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-gray-500 text-lg font-medium">2つ以上のポイントを選択してください</p>
            <p className="text-gray-400 text-sm mt-2">上のリストから比較したいポイントを選んでください</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium bg-gray-50 border-b border-gray-100 w-32">
                      比較項目
                    </th>
                    {selectedPrograms.map((p) => (
                      <th
                        key={p.id}
                        className="p-4 text-center border-b border-gray-100"
                        style={{ borderTop: `4px solid ${p.color}` }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                            style={{ backgroundColor: p.color, color: p.textColor }}
                          >
                            {p.name[0]}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{p.name}</span>
                          <button
                            onClick={() => toggleProgram(p.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ✕ 削除
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FIELDS.map((field, i) => (
                    <tr key={field.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 text-sm font-medium text-gray-700 border-r border-gray-100">
                        {field.label}
                      </td>
                      {selectedPrograms.map((p) => (
                        <td key={p.id} className="p-4 text-center text-sm text-gray-800">
                          {field.format(p[field.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Pros row */}
                  <tr className="bg-green-50">
                    <td className="p-4 text-sm font-medium text-gray-700 border-r border-gray-100 align-top">
                      メリット
                    </td>
                    {selectedPrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sm text-gray-700 align-top">
                        <ul className="space-y-1">
                          {p.pros.map((pro) => (
                            <li key={pro} className="text-xs text-green-700">
                              ✓ {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  {/* Cons row */}
                  <tr className="bg-red-50">
                    <td className="p-4 text-sm font-medium text-gray-700 border-r border-gray-100 align-top">
                      デメリット
                    </td>
                    {selectedPrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sm text-gray-700 align-top">
                        <ul className="space-y-1">
                          {p.cons.map((con) => (
                            <li key={con} className="text-xs text-red-700">
                              ✗ {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
