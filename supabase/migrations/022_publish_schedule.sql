-- 定時発行（代発行）機能

-- article_status: 代発行待ち（手動で公開せず、タイマーによる発行を待つ状態）
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'queued';

-- 定時発行タイマー設定（日本時間の時・分、1回あたりの発行数）。複数登録可能
create table publish_schedules (
  id uuid primary key default gen_random_uuid(),
  hour smallint not null check (hour between 0 and 23),
  minute smallint not null default 0 check (minute between 0 and 59),
  count smallint not null default 1 check (count > 0),
  enabled boolean not null default true,
  -- 同じタイマーが同日に二重発火しないようにするための最終実行日（JST日付）
  last_run_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table publish_schedules enable row level security;
-- 読み書きはAdmin（createAdminClient経由）のみ

create trigger trg_publish_schedules_updated_at before update on publish_schedules
  for each row execute function set_updated_at();
