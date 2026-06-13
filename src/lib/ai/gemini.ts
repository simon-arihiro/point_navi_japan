import type { GenerateTextOptions, ImageInput } from "./types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TEXT_MODEL = "gemini-2.5-flash";

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

// Gemini無料枠の日次リクエスト数上限に達した場合（HTTP 429）に投げるエラー
export class GeminiQuotaExceededError extends Error {
  constructor() {
    super("Gemini APIの無料枠（1日あたりのリクエスト数上限）に達しました");
    this.name = "GeminiQuotaExceededError";
  }
}

// Gemini 2.5 Flash Image（Nano Banana）でテキストプロンプトから画像を1枚生成する
export async function generateImage(prompt: string): Promise<GeneratedImage | null> {
  const apiKey = getApiKey();

  const res = await fetch(`${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (res.status === 429) {
    throw new GeminiQuotaExceededError();
  }
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

// Gemini 2.5 Flashでテキストを生成する（画像入力も可）
export async function generateText(systemPrompt: string, userPrompt: string, images?: ImageInput[], options?: GenerateTextOptions): Promise<string> {
  const apiKey = getApiKey();

  const requestParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = (images ?? []).map((image) => ({
    inlineData: { mimeType: image.mediaType, data: image.data },
  }));
  requestParts.push({ text: userPrompt });

  const res = await fetch(`${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: requestParts }],
      ...(options?.search ? { tools: [{ google_search: {} }] } : {}),
    }),
  });

  if (res.status === 429) {
    throw new GeminiQuotaExceededError();
  }
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part: { text?: string }) => part.text ?? "").join("");
  if (!text) throw new Error("Gemini APIからテキストが返されませんでした");
  return text;
}
