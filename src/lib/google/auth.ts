import { google } from "googleapis";

// GA4 Data API / Search Console API 共通のサービスアカウント認証。
// Vercel環境変数 GOOGLE_SERVICE_ACCOUNT_KEY に、サービスアカウントのJSON鍵全体を
// そのまま（改行含む）文字列として設定する。未設定の場合はnullを返し、呼び出し側でフォールバックする
export function getGoogleAuth(scopes: string[]): InstanceType<typeof google.auth.GoogleAuth> | null {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) return null;

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(rawKey);
  } catch {
    return null;
  }

  return new google.auth.GoogleAuth({ credentials, scopes });
}
