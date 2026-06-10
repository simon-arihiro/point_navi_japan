-- v1.4.6: hide_articles_on_inactive を Service ごとの設定からグローバル設定へ移行

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS hide_articles_on_inactive boolean NOT NULL DEFAULT false;
ALTER TABLE services DROP COLUMN IF EXISTS hide_articles_on_inactive;
