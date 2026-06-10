import { Service } from "@/types/database";

export type CampaignBadge = {
  label: string;
  urgent: boolean;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

// JST基準の日付通し番号（カレンダー日の差分計算用）
function toJstDayNumber(ms: number): number {
  return Math.floor((ms + JST_OFFSET_MS) / DAY_MS);
}

// 期間限定キャンペーン徽章（F.10）。期限切れ・未設定時は null
export function getCampaignBadge(
  service: Pick<Service, "campaign_expires_at">
): CampaignBadge | null {
  if (!service.campaign_expires_at) return null;

  const expiresAtMs = new Date(service.campaign_expires_at).getTime();
  const nowMs = Date.now();
  if (expiresAtMs <= nowMs) return null;

  const remainingDays = toJstDayNumber(expiresAtMs) - toJstDayNumber(nowMs);
  const label = remainingDays <= 0 ? "本日まで" : `あと${remainingDays}日`;

  return { label, urgent: remainingDays <= 3 };
}

// Admin フォーム: ISO文字列 → datetime-local input value
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Admin フォーム: datetime-local input value → ISO文字列（空なら null）
export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}
