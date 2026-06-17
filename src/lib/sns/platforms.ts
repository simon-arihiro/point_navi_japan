import type { DistributionPlatform } from "@/types/database";

export type SnsPlatformField = { key: string; label: string };

export type SnsPlatformDef = {
  id: DistributionPlatform;
  label: string;
  // true: 実際にAPIを呼び出して配信する／false: 設定・トリガーUIのみ用意されており、配信実行時はエラーとして記録される
  implemented: boolean;
  fields: SnsPlatformField[];
};

export const SNS_PLATFORMS: SnsPlatformDef[] = [
  {
    id: "x",
    label: "X (Twitter)",
    implemented: true,
    fields: [
      { key: "api_key", label: "API Key" },
      { key: "api_secret", label: "API Key Secret" },
      { key: "access_token", label: "Access Token" },
      { key: "access_token_secret", label: "Access Token Secret" },
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    implemented: false,
    fields: [
      { key: "page_id", label: "Page ID" },
      { key: "page_access_token", label: "Page Access Token" },
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    implemented: false,
    fields: [
      { key: "access_token", label: "Access Token" },
    ],
  },
  {
    id: "threads",
    label: "Threads",
    implemented: false,
    fields: [
      { key: "access_token", label: "Access Token" },
    ],
  },
];
