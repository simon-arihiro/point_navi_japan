// AIプロバイダー間で共有する型定義
export type ImageInput = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string; // base64（データURLのprefixなし）
};

// テキスト生成タスクの追加オプション
export type GenerateTextOptions = {
  // Web検索ツールを有効化する（対応プロバイダーのみ）
  search?: boolean;
};
