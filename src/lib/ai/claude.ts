import Anthropic from "@anthropic-ai/sdk";
import type { GenerateTextOptions, ImageInput } from "./types";

export type { ImageInput } from "./types";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateText(systemPrompt: string, userPrompt: string, images?: ImageInput[], options?: GenerateTextOptions): Promise<string> {
  const client = getClient();

  const content: Anthropic.Messages.ContentBlockParam[] = (images ?? []).map((image) => ({
    type: "image" as const,
    source: { type: "base64" as const, media_type: image.mediaType, data: image.data },
  }));
  content.push({ type: "text", text: userPrompt });

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content }],
    ...(options?.search ? { tools: [{ type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 5 }] } : {}),
  });

  const textBlocks = message.content.filter((block): block is Anthropic.Messages.TextBlock => block.type === "text");
  if (textBlocks.length === 0) throw new Error("Unexpected response type from Claude");
  return textBlocks.map((block) => block.text).join("\n");
}
