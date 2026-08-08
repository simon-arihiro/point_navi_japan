-- 検索キーワード「結果なし」ログテーブル
CREATE TABLE IF NOT EXISTS search_no_results_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  page text NOT NULL DEFAULT 'codes', -- どのページの検索か（codes / site）
  created_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス（キーワード集計用）
CREATE INDEX IF NOT EXISTS idx_search_no_results_keyword ON search_no_results_log (keyword);
CREATE INDEX IF NOT EXISTS idx_search_no_results_created_at ON search_no_results_log (created_at DESC);

-- anon ロールに INSERT 権限（APIから書き込めるよう）
GRANT INSERT ON search_no_results_log TO anon;
GRANT SELECT ON search_no_results_log TO anon;
