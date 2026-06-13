// AIプロバイダー間で共有する型定義
export type ImageInput = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string; // base64（データURLのprefixなし）
};
