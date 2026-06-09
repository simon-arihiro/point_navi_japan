-- Spec v1.3.0 additions

-- article_status: add rejected
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'rejected';

-- services: hide_articles_on_inactive
ALTER TABLE services ADD COLUMN IF NOT EXISTS hide_articles_on_inactive boolean NOT NULL DEFAULT false;

-- articles: revision_count
ALTER TABLE articles ADD COLUMN IF NOT EXISTS revision_count int NOT NULL DEFAULT 0;

-- system_settings: auto_generate_enabled, max_pending_articles
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS auto_generate_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS max_pending_articles int NOT NULL DEFAULT 10;
UPDATE system_settings SET auto_generate_enabled = true, max_pending_articles = 10 WHERE id = 1;
