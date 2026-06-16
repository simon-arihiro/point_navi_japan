-- Security Advisor指摘: set_updated_at()のsearch_pathが固定されていない（Function Search Path Mutable）
-- search_pathを明示的に固定し、スキーマなりすましによるハイジャックを防ぐ
create or replace function set_updated_at()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
