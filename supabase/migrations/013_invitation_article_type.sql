-- article_type に「招待記事」(invitation) を追加
-- 注意: ALTER TYPE ... ADD VALUE は同一トランザクション内で追加した値を使用できないため、
-- この文を含むファイルは他の変更（INSERT/UPDATE等）と分離して実行すること

ALTER TYPE article_type ADD VALUE IF NOT EXISTS 'invitation';
