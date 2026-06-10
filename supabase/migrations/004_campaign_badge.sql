-- v1.7.0: 期間限定キャンペーン徽章（F.10）

ALTER TABLE services ADD COLUMN IF NOT EXISTS campaign_bonus text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS campaign_expires_at timestamptz;
