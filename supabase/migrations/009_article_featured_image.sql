-- 記事のアイキャッチ画像URL（AI自動生成 or 管理者が手動アップロード/差し替え）。
-- 未設定の場合はフロント側で本文内の最初の画像（extractFirstImageUrl）にフォールバックする。

alter table articles add column if not exists featured_image_url text;
