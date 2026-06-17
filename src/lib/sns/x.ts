import crypto from "crypto";

type XCredentials = {
  api_key: string;
  api_secret: string;
  access_token: string;
  access_token_secret: string;
};

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// X(Twitter) API v2は OAuth 1.0a（ユーザーコンテキスト）でのツイート投稿に対応している。
// JSONボディのPOSTでは署名ベース文字列にoauth_*パラメータのみを含める（クエリ・ボディパラメータは含めない）
function buildOAuthHeader(method: string, url: string, credentials: XCredentials): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.api_key,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.access_token,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(credentials.api_secret)}&${percentEncode(credentials.access_token_secret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(headerParams[k])}"`)
      .join(", ")
  );
}

export async function postTweet(text: string, credentials: XCredentials): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!credentials?.api_key || !credentials?.api_secret || !credentials?.access_token || !credentials?.access_token_secret) {
    return { ok: false, error: "X (Twitter) のAPIクレデンシャルが未設定です" };
  }

  const url = "https://api.twitter.com/2/tweets";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: buildOAuthHeader("POST", url, credentials),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = json?.detail || json?.title || json?.errors?.[0]?.message || `X API error: ${res.status}`;
      return { ok: false, error: message };
    }
    return { ok: true, id: json?.data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "X APIへの接続に失敗しました" };
  }
}
