-- 付与金額は「25〜30」のような範囲表記に対応するため text 型に変更する
ALTER TABLE services ALTER COLUMN bonus_amount TYPE text USING bonus_amount::text;
