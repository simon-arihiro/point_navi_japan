export type ServiceStatus = "active" | "inactive";
export type ArticleType = "introduction" | "guide" | "faq" | "comparison" | "campaign" | "earnings" | "invitation";
export type ArticleStatus = "draft" | "reviewing" | "published" | "rejected" | "archived";
export type EventType =
  | "page_view"
  | "service_view"
  | "article_view"
  | "copy_code"
  | "referral_click"
  | "share_link"
  | "ranking_click";
export type DistributionPlatform = "x" | "instagram" | "threads";
export type DistributionStatus = "pending" | "success" | "failed";
export type NotificationType = "article_pending" | "ai_failed" | "image_failed" | "distribution_failed";
export type OperationMode = "manual" | "auto";

// AI機能（タスク）の種類: AI補完 / AI画像生成 / AI記事生成（書き直し含む）
export type AiTaskId = "autofill" | "image" | "article";
// 接続済みのAIプロバイダー
export type AiProviderId = "gemini" | "claude";
// タスクごとの優先順位付きプロバイダー一覧
export type AiProviderSettings = Record<AiTaskId, AiProviderId[]>;
// AIプロンプトライブラリの用途: 記事本文生成 / サムネイル画像生成
export type AiPromptCategory = "article" | "thumbnail";


export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  referral_code: string | null;
  referral_link: string | null;
  bonus_points: number | null;
  bonus_amount: string | null;
  campaign_bonus: string | null;
  campaign_expires_at: string | null;
  catch_copy: string | null;
  official_url: string;
  logo_url: string | null;
  logo_storage_path: string | null;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ServiceCategory {
  service_id: string;
  category_id: string;
}

export interface ServiceTag {
  service_id: string;
  tag_id: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  storage_path: string;
  source_url: string;
  created_at: string;
}

export interface Article {
  id: string;
  primary_service_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  article_type: ArticleType;
  status: ArticleStatus;
  revision_count: number;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ArticleService {
  article_id: string;
  service_id: string;
}

export interface AnalyticsEvent {
  id: string;
  service_id: string | null;
  article_id: string | null;
  event_type: EventType;
  source: string;
  device: string;
  session_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsDaily {
  date: string;
  service_id: string;
  page_views: number;
  referral_clicks: number;
  copy_code_count: number;
  share_count: number;
}

export interface DistributionLog {
  id: string;
  article_id: string;
  platform: DistributionPlatform;
  status: DistributionStatus;
  error_message: string | null;
  distributed_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface SystemSettings {
  id: 1;
  operation_mode: OperationMode;
  auto_generate_enabled: boolean;
  auto_distribution: boolean;
  daily_article_count: number;
  max_pending_articles: number;
  ranking_window_days: number;
  hide_articles_on_inactive: boolean;
  ai_multi_provider_enabled: boolean;
  ai_provider_settings: AiProviderSettings;
  thumbnail_auto_generate: boolean;
  updated_at: string;
}

export interface AiPrompt {
  id: string;
  title: string;
  content: string;
  category: AiPromptCategory;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Joined types for UI
export interface ServiceWithRelations extends Service {
  categories?: Category[];
  tags?: Tag[];
  images?: ServiceImage[];
}

export interface ArticleWithService extends Article {
  primary_service?: Service;
  related_services?: Service[];
}

export interface RankedService extends Service {
  score: number;
  page_views: number;
  referral_clicks: number;
  copy_code_count: number;
}
