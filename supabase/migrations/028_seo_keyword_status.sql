-- SEO改善機会のステータス管理テーブル
CREATE TABLE IF NOT EXISTS seo_keyword_status (
  query        TEXT PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  notes        TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
