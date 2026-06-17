-- 記事ごとに手動でSNS等の外部プラットフォームへ配信できるようにする設定列
-- 注意: distribution_platform への 'facebook' 追加(ALTER TYPE ADD VALUE)は
-- 同一トランザクション内で使用できないため、このファイル単体で実行すること

ALTER TYPE distribution_platform ADD VALUE IF NOT EXISTS 'facebook';
