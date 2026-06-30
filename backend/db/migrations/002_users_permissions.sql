begin;

create table if not exists permissions (
  key text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id text references roles(id) on delete cascade,
  permission_key text references permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);

create table if not exists app_users (
  id text primary key,
  name text not null,
  email text unique,
  role_id text references roles(id),
  title text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_permissions (
  user_id text references app_users(id) on delete cascade,
  permission_key text references permissions(key) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, permission_key)
);

create index if not exists app_users_role_id_idx on app_users(role_id);
create index if not exists app_users_active_idx on app_users(active);
create index if not exists user_permissions_permission_key_idx on user_permissions(permission_key);

insert into roles (id, name) values
  ('brand', 'Brand'),
  ('owner', 'Owner'),
  ('staff', 'Staff')
on conflict (id) do update set name = excluded.name;

insert into permissions (key, label, description) values
  ('brand.read', 'View brands', 'View brand and campaign data'),
  ('brand.write', 'Create and edit brands', 'Create or update brand records'),
  ('brand.delete', 'Delete brands', 'Delete brands and related campaign data'),
  ('campaign.write', 'Manage campaigns', 'Create and update campaign setup'),
  ('influencer.create', 'Add influencers', 'Add influencer candidates'),
  ('influencer.review', 'Review influencers', 'Approve, reject, or confirm influencer candidates'),
  ('influencer.brand_select', 'Brand selection', 'Select influencers as a brand user'),
  ('influencer.track', 'Track production', 'Update draft, post, asset, and payment tracking fields'),
  ('employee.manage', 'Manage employees', 'Create, edit, disable, and delete employees'),
  ('permission.manage', 'Manage permissions', 'Assign permissions to employees')
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description;

insert into role_permissions (role_id, permission_key) values
  ('owner', 'brand.read'),
  ('owner', 'brand.write'),
  ('owner', 'brand.delete'),
  ('owner', 'campaign.write'),
  ('owner', 'influencer.create'),
  ('owner', 'influencer.review'),
  ('owner', 'influencer.track'),
  ('owner', 'employee.manage'),
  ('owner', 'permission.manage'),
  ('brand', 'brand.read'),
  ('brand', 'influencer.brand_select'),
  ('staff', 'brand.read'),
  ('staff', 'influencer.create'),
  ('staff', 'influencer.track')
on conflict do nothing;

insert into app_users (id, name, email, role_id, title, active) values
  ('owner', 'หัวหน้า', 'owner@agencyhub.local', 'owner', 'Owner', true),
  ('brand', 'Brand', 'brand@agencyhub.local', 'brand', 'Brand user', true),
  ('staff', 'Staff', 'staff@agencyhub.local', 'staff', 'Staff', true)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role_id = excluded.role_id,
  title = excluded.title,
  active = excluded.active,
  updated_at = now();

commit;
