-- お問い合わせフォームからのメッセージ保存用テーブル
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_contact_messages_is_read on contact_messages (is_read);

alter table contact_messages enable row level security;
-- 読み書きはAdmin（createAdminClient経由）のみ。公開フォームの送信もサーバー側でservice role経由で行う
