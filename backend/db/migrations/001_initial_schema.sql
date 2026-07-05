begin;

create table if not exists roles (
  id text primary key,
  name text not null unique
);

create table if not exists brands (
  id text primary key,
  name text not null,
  category text,
  contact text,
  active_campaigns integer,
  health text,
  initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id text primary key,
  brand_id text references brands(id) on delete set null,
  brand_name text,
  name text not null,
  objective text,
  status text,
  progress integer,
  confirmed_influencers integer,
  influencer_target integer,
  posted_content integer,
  pending_review integer,
  waiting_brand_selection integer,
  brand_quota integer,
  team_submitted integer,
  owner_approved integer,
  brand_selected integer,
  due_date text,
  budget text,
  start_date text,
  deadline_date text,
  target integer,
  brief_file text,
  brief_version text,
  brief_date text,
  tier_stats jsonb,
  campaign_settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists influencers (
  id text primary key,
  campaign_id text references campaigns(id) on delete set null,
  name text not null,
  channel text,
  channels jsonb,
  tier text,
  followers text,
  added_by text,
  added_by_role text,
  deal_date text,
  status text,
  draft_status text,
  draft text,
  product_sent boolean,
  post_date text,
  post_link text,
  asset_link text,
  bank jsonb,
  senior_approval jsonb,
  extra_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tier_targets (
  id text primary key,
  campaign_id text references campaigns(id) on delete cascade,
  tier text not null,
  target integer,
  owner_approved integer,
  brand_selected integer,
  sourced integer,
  confirmed integer,
  posted integer
);

create table if not exists brief_versions (
  id text primary key,
  campaign_id text references campaigns(id) on delete cascade,
  version text,
  uploaded_at text,
  uploaded_by text,
  brief_file text,
  brief_date text
);

create table if not exists notifications (
  id text primary key,
  role text,
  title text not null,
  message text,
  unread boolean,
  time text,
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id text primary key,
  user_name text,
  action text not null,
  time text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  owner text,
  due text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists draft_statuses (
  id text primary key,
  name text not null unique
);

create index if not exists campaigns_brand_id_idx on campaigns(brand_id);
create index if not exists influencers_campaign_id_idx on influencers(campaign_id);
create index if not exists notifications_role_idx on notifications(role);
create index if not exists tasks_status_idx on tasks(status);

commit;
