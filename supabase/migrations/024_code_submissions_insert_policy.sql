-- code_submissionsへのINSERTポリシー（anon権限で投稿可能にする）
DROP POLICY IF EXISTS "anon insert code_submissions" ON code_submissions;
CREATE POLICY "anon insert code_submissions" ON code_submissions FOR INSERT WITH CHECK (true);
