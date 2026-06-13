const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image";

function getApiKey(): string {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return process.env.GEMINI_API_KEY;
}

export type GeneratedImage = {
  mimeType: string;
  data: string; // base64（データURLのprefixなし）
};

// Gemini 2.5 Flash Image（Nano Banana）でテキストプロンプトから画像を1枚生成する
export async function generateImage(prompt: string): Promise<GeneratedImage | null> {
  const apiKey = getApiKey();

  const res = await fetch(`${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return { mimeType: part.inlineData.mimeType ?? "image/png", data: part.inlineData.data };
    }
  }
  return null;
}
