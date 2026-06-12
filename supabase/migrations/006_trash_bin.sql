-- v1.9.0: ゴミ箱機能（論理削除 + 復元 + 自動完全削除）

-- 論理削除用カラム追加
ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ゴミ箱一覧・自動完全削除バッチ用インデックス
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services (deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles (deleted_at);
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories (deleted_at);

-- 公開向け RLS ポリシー: 論理削除されたレコードを除外
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "public_read_articles" ON articles;
CREATE POLICY "public_read_articles" ON articles FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
