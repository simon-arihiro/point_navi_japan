-- プラットフォームごとの有効/無効・APIクレデンシャルを保存する設定列
-- 例: { "x": { "enabled": true, "credentials": { "api_key": "...", "api_secret": "...", "access_token": "...", "access_token_secret": "..." } } }

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS sns_platform_settings jsonb NOT NULL DEFAULT '{}'::jsonb;
