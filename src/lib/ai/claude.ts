import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateText(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

// AIの応答に前置き・コードブロック等が混在していてもJSON部分のみを抽出してパースする
export function extractJson<T = unknown>(text: string): T | null {
  const cleaned = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
