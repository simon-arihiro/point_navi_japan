import type { AiProviderId, AiProviderSettings, AiTaskId } from "@/types/database";

export interface AiProviderInfo {
  id: AiProviderId;
  label: string;
  description: string;
  capabilities: AiTaskId[];
}

// 接続済みのAIプロバイダー一覧（capabilitiesは各プロバイダーが対応可能なタスク）
export const AI_PROVIDERS: AiProviderInfo[] = [
  {
    id: "gemini",
    label: "Gemini",
    description: "Google Gemini API（gemini-2.5-flash / gemini-2.5-flash-image）。無料枠あり",
    capabilities: ["autofill", "image", "article"],
  },
  {
    id: "claude",
    label: "Claude",
    description: "Anthropic Claude API（claude-opus-4-8）。従量課金",
    capabilities: ["autofill", "article"],
  },
];

export interface AiTaskInfo {
  id: AiTaskId;
  label: string;
  description: string;
}

// AI機能（タスク）一覧
export const AI_TASKS: AiTaskInfo[] = [
  { id: "autofill", label: "AI補完", description: "新規サービス登録時、公式URLから名称・説明・カテゴリ・タグ等を自動入力" },
  { id: "image", label: "AI画像生成", description: "記事のアイキャッチ画像を生成" },
  { id: "article", label: "AI記事生成", description: "記事本文・概要(meta description)の生成、既存記事の書き直し" },
];

// マイグレーション未実行・未設定時に使用するデフォルトの優先順位
export const DEFAULT_AI_PROVIDER_SETTINGS: AiProviderSettings = {
  autofill: ["gemini", "claude"],
  image: ["gemini"],
  article: ["claude", "gemini"],
};

// 指定タスクに対応可能なプロバイダー一覧を返す
export function providersForTask(taskId: AiTaskId): AiProviderInfo[] {
  return AI_PROVIDERS.filter((p) => p.capabilities.includes(taskId));
}
