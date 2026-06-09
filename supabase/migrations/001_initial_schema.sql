-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Enums
create type service_status as enum ('active', 'inactive');
create type article_type as enum ('introduction', 'guide', 'faq', 'comparison', 'campaign', 'earnings');
create type article_status as enum ('draft', 'reviewing', 'approved', 'published', 'archived');
create type event_type as enum ('page_view', 'service_view', 'article_view', 'copy_code', 'referral_click', 'share_link', 'ranking_click');
create type distribution_platform as enum ('x', 'instagram', 'threads');
create type distribution_status as enum ('pending', 'success', 'failed');
create type notification_type as enum ('article_pending', 'ai_failed', 'image_failed', 'distribution_failed');
create type operation_mode as enum ('manual', 'auto');

-- services
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  referral_code text,
  referral_link text,
  official_url text not null,
  logo_url text,
  logo_storage_path text,
  status service_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- service_categories
create table service_categories (
  service_id uuid not null references services(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (service_id, category_id)
);

-- service_tags
create table service_tags (
  service_id uuid not null references services(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (service_id, tag_id)
);

-- service_images
create table service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  storage_path text not null,
  source_url text not null,
  created_at timestamptz not null default now()
);

-- articles
create table articles (
  id uuid primary key default gen_random_uuid(),
  primary_service_id uuid not null references services(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  content text not null default '',
  article_type article_type not null,
  status article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- article_services (for comparison articles with multiple services)
create table article_services (
  article_id uuid not null references articles(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (article_id, service_id)
);

-- analytics_events
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete set null,
  article_id uuid references articles(id) on delete set null,
  event_type event_type not null,
  source text not null default '',
  device text not null default '',
  session_id text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- analytics_daily (aggregated)
create table analytics_daily (
  date date not null,
  service_id uuid not null references services(id) on delete cascade,
  page_views int not null default 0,
  referral_clicks int not null default 0,
  copy_code_count int not null default 0,
  share_count int not null default 0,
  primary key (date, service_id)
);

-- distribution_logs
create table distribution_logs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  platform distribution_platform not null,
  status distribution_status not null default 'pending',
  error_message text,
  distributed_at timestamptz,
  created_at timestamptz not null default now()
);

-- admin_notifications
create table admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null,
  payload jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- system_settings (single row)
create table system_settings (
  id int primary key default 1 check (id = 1),
  operation_mode operation_mode not null default 'manual',
  auto_distribution boolean not null default false,
  daily_article_count int not null default 1,
  ranking_window_days int not null default 30,
  updated_at timestamptz not null default now()
);
insert into system_settings (id) values (1);

-- Indexes
create index on analytics_events (service_id, event_type, created_at);
create index on analytics_events (article_id, event_type, created_at);
create index on analytics_daily (service_id, date);
create index on articles (primary_service_id, status, article_type);
create index on articles (status, published_at);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_services_updated_at before update on services
  for each row execute function set_updated_at();
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();
create trigger trg_articles_updated_at before update on articles
  for each row execute function set_updated_at();
create trigger trg_settings_updated_at before update on system_settings
  for each row execute function set_updated_at();

-- Row Level Security
alter table services enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table service_categories enable row level security;
alter table service_tags enable row level security;
alter table service_images enable row level security;
alter table articles enable row level security;
alter table article_services enable row level security;
alter table analytics_events enable row level security;
alter table analytics_daily enable row level security;
alter table distribution_logs enable row level security;
alter table admin_notifications enable row level security;
alter table system_settings enable row level security;

-- Public read policies
create policy "public_read_services" on services for select using (status = 'active');
create policy "public_read_categories" on categories for select using (true);
create policy "public_read_tags" on tags for select using (true);
create policy "public_read_service_categories" on service_categories for select using (true);
create policy "public_read_service_tags" on service_tags for select using (true);
create policy "public_read_service_images" on service_images for select using (true);
create policy "public_read_articles" on articles for select using (status = 'published');
create policy "public_read_article_services" on article_services for select using (true);
create policy "public_read_analytics_daily" on analytics_daily for select using (true);

-- Analytics events: public insert only
create policy "public_insert_analytics" on analytics_events for insert with check (true);

-- Service role (admin) full access via service_role key (bypasses RLS)
