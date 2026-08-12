-- サービスに招待文（SNSシェア用テンプレート）カラムを追加
ALTER TABLE services ADD COLUMN IF NOT EXISTS invitation_text TEXT;
