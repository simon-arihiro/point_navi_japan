-- 掲示板：ユーザー投稿の招待コードテーブル
CREATE TABLE code_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  nickname text NOT NULL DEFAULT 'ななしの投稿者',
  referral_code text NOT NULL,
  comment text,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX code_submissions_service_id_idx ON code_submissions(service_id);
CREATE INDEX code_submissions_ip_hash_idx ON code_submissions(ip_hash, created_at DESC);
CREATE INDEX code_submissions_created_at_idx ON code_submissions(created_at DESC);

-- 一般ユーザーは読み取りのみ可（書き込みはAPIルートのservice_role経由）
ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read code_submissions" ON code_submissions FOR SELECT USING (true);
