// サービス名から一貫した配色を生成する（ロゴ未設定時のアバター・カード背景色などに使用）
// "use client" を持つコンポーネントからもサーバーコンポーネントからも利用できるよう、
// 純粋関数として独立したモジュールに切り出している
const AUTO_COLORS = [
  "#E53E3E", "#DD6B20", "#D69E2E", "#38A169",
  "#3182CE", "#805AD5", "#D53F8C", "#319795",
];

export function getAutoColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AUTO_COLORS[Math.abs(hash) % AUTO_COLORS.length];
}
