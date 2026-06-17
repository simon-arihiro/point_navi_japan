// GA4へカスタムイベントを送信する薄いラッパー。
// gtag未設置（NEXT_PUBLIC_GA_ID未設定）時は何もしない
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGaEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
