-- 招待コードカードの「新規登録はお得！」を置き換える、サービスごとの2行キャッチコピー
ALTER TABLE services ADD COLUMN IF NOT EXISTS catch_copy text;
