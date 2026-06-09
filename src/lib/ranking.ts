import { RankedService } from "@/types/database";

/**
 * Hot Ranking: score = page_views + referral_clicks×2 + copy_code_count×1
 * Profit Ranking: score = referral_clicks×5 + copy_code_count×2
 */
export function calcHotScore(pv: number, rc: number, cc: number) {
  return pv + rc * 2 + cc;
}

export function calcProfitScore(rc: number, cc: number) {
  return rc * 5 + cc * 2;
}

export function sortByHot(services: RankedService[]) {
  return [...services].sort((a, b) => b.score - a.score);
}
