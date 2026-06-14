import type { DailyStats } from "@/lib/analytics";

const CHART_HEIGHT = 160;
const CHART_WIDTH = 1000;
const PADDING_LEFT = 36;

// データ点の配列から折れ線グラフ用のSVG pathを生成する
function buildPath(values: number[], max: number, width: number, height: number): string {
  if (values.length === 0) return "";
  const step = values.length > 1 ? (width - PADDING_LEFT) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = PADDING_LEFT + i * step;
      const y = max > 0 ? height - (v / max) * height : height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// 日別・月別トレンドを折れ線グラフで表示するシンプルなSVGチャート（クライアントJS不要）
export default function TrendChart({ data, series }: { data: DailyStats[]; series: { key: "pv" | "rc" | "cc" | "share"; label: string; color: string }[] }) {
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key])));

  return (
    <div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 24}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Y軸の目安線 */}
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={PADDING_LEFT}
              x2={CHART_WIDTH}
              y1={CHART_HEIGHT * (1 - ratio)}
              y2={CHART_HEIGHT * (1 - ratio)}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
            <text x={0} y={CHART_HEIGHT * (1 - ratio) + 4} fontSize={10} fill="#9ca3af">
              {Math.round(max * ratio).toLocaleString()}
            </text>
          </g>
        ))}

        {series.map((s) => (
          <path
            key={s.key}
            d={buildPath(data.map((d) => d[s.key]), max, CHART_WIDTH, CHART_HEIGHT)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
          />
        ))}

        {/* X軸ラベル（開始・中間・終了のみ表示） */}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => {
          const step = data.length > 1 ? (CHART_WIDTH - PADDING_LEFT) / (data.length - 1) : 0;
          const x = PADDING_LEFT + i * step;
          return (
            <text key={i} x={x} y={CHART_HEIGHT + 18} fontSize={10} fill="#9ca3af" textAnchor="middle">
              {data[i]?.date.slice(5)}
            </text>
          );
        })}
      </svg>

      <div className="flex gap-4 mt-2 text-xs">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
