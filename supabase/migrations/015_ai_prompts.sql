-- AIコンテンツ作成時に参考にするプロンプトを保存・閲覧するためのライブラリ
create table ai_prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ai_prompts enable row level security;
-- 読み書きはAdmin（createAdminClient経由）のみ
