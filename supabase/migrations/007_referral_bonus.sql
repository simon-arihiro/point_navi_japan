-- 招待コード/リンク経由で得られる「付与ポイント」「付与金額」を追加

ALTER TABLE services ADD COLUMN IF NOT EXISTS bonus_points integer;
ALTER TABLE services ADD COLUMN IF NOT EXISTS bonus_amount integer;
