import { createAdminClient } from "@/lib/supabase/server";
import { generateText as claudeGenerateText } from "./claude";
import { generateText as geminiGenerateText, generateImage as geminiGenerateImage, GeneratedImage } from "./gemini";
import { DEFAULT_AI_PROVIDER_SETTINGS, providersForTask } from "./providers";
import type { GenerateTextOptions, ImageInput } from "./types";
import type { AiProviderId, AiProviderSettings, AiTaskId } from "@/types/database";

// system_settingsからAIプロバイダー設定を取得する。マイグレーション未実行・未設定時はデフォルト値を返す
export async function getAiProviderSettings(): Promise<{ multiEnabled: boolean; settings: AiProviderSettings }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("ai_multi_provider_enabled, ai_provider_settings")
      .eq("id", 1)
      .single();
    if (error || !data) throw error ?? new Error("system_settings not found");

    return {
      multiEnabled: data.ai_multi_provider_enabled ?? false,
      settings: { ...DEFAULT_AI_PROVIDER_SETTINGS, ...(data.ai_provider_settings ?? {}) },
    };
  } catch {
    return { multiEnabled: false, settings: DEFAULT_AI_PROVIDER_SETTINGS };
  }
}

// タスクに対応可能なプロバイダーのうち、設定された優先順位の配列を返す。
// 複数AIが無効な場合は最優先の1件のみを返す
function resolveOrder(task: AiTaskId, settings: AiProviderSettings, multiEnabled: boolean): AiProviderId[] {
  const capable = providersForTask(task).map((p) => p.id);
  const configured = (settings[task] ?? DEFAULT_AI_PROVIDER_SETTINGS[task]).filter((id) => capable.includes(id));
  const order = configured.length > 0 ? configured : capable;
  return multiEnabled ? order : order.slice(0, 1);
}

// タスクごとの優先順位設定に従ってテキスト生成を行う。
// 複数AI有効時は、優先度の高いプロバイダーでエラーが発生すると次の優先度のプロバイダーへ自動でフォールバックする
export async function generateTaskText(
  task: AiTaskId,
  systemPrompt: string,
  userPrompt: string,
  images?: ImageInput[],
  options?: GenerateTextOptions
): Promise<string> {
  const { multiEnabled, settings } = await getAiProviderSettings();
  const order = resolveOrder(task, settings, multiEnabled);

  let lastErr: unknown;
  for (const provider of order) {
    try {
      return provider === "gemini"
        ? await geminiGenerateText(systemPrompt, userPrompt, images, options)
        : await claudeGenerateText(systemPrompt, userPrompt, images, options);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("利用可能なAIプロバイダーが設定されていません");
}

// 設定に従って画像を生成する（現在対応しているのはGeminiのみ）。
// 複数AI有効時、画像対応プロバイダーが複数あれば順にフォールバックする
export async function generateTaskImage(prompt: string): Promise<GeneratedImage | null> {
  const { multiEnabled, settings } = await getAiProviderSettings();
  const order = resolveOrder("image", settings, multiEnabled);

  let lastErr: unknown;
  for (const provider of order) {
    try {
      if (provider === "gemini") return await geminiGenerateImage(prompt);
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}
