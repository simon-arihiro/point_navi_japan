-- ゴミ箱（論理削除）内のレコードはslugのユニーク制約から除外し、
-- 同じslugで新規作成・復元できるようにする

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON services (slug) WHERE deleted_at IS NULL;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON categories (slug) WHERE deleted_at IS NULL;

ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_key ON articles (slug) WHERE deleted_at IS NULL;
