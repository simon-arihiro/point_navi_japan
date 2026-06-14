-- AIプロンプトライブラリにカテゴリ（用途）を追加：記事本文用 / サムネイル画像用
alter table ai_prompts add column category text not null default 'article' check (category in ('article', 'thumbnail'));

-- デフォルトはカテゴリごとに1件まで選択可能にする
drop index if exists ai_prompts_single_default_idx;
create unique index ai_prompts_single_default_idx on ai_prompts (category) where is_default;

-- 記事生成時にアイキャッチ画像を自動生成するかどうかのトグル
alter table system_settings add column thumbnail_auto_generate boolean not null default true;
