-- AI機能（AI補完・AI画像生成・AI記事生成）ごとに使用するAIプロバイダーと優先順位を設定可能にする

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_multi_provider_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ai_provider_settings jsonb NOT NULL DEFAULT '{
  "autofill": ["gemini", "claude"],
  "image": ["gemini"],
  "article": ["claude", "gemini"]
}'::jsonb;
