-- 0005_multi_tenant.sql — Multi-tenant architecture with studios and platform_admin role

-- 1. Create studios table
create table if not exists studios (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique check (slug = lower(slug)),
  address                 text,
  phone                   text,
  plan_tier               text not null default 'standard' check (plan_tier in ('starter','standard','pro','enterprise')),
  is_active               boolean not null default true,
  subscription_expires_at date,
  created_at              timestamptz not null default now()
);

create index if not exists idx_studios_slug on studios(slug);

-- 2. Insert default initial studio
insert into studios (id, name, slug, address, phone, plan_tier, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'FitZone Studio Utama',
  'fitzone-main',
  'Jl. Sudirman No. 45, Jakarta Selatan',
  '081234567890',
  'pro',
  true
)
on conflict (slug) do nothing;

-- 3. Update users table for platform_admin role and studio_id
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('platform_admin', 'admin', 'manager', 'pt'));

alter table users add column if not exists studio_id uuid references studios(id) on delete set null;
create index if not exists idx_users_studio on users(studio_id);

-- Assign existing users to default studio
update users
set studio_id = '00000000-0000-0000-0000-000000000001'
where studio_id is null and role <> 'platform_admin';

-- 4. Seed superadmin / platform_admin user
-- Password: "devpass123"
insert into users (email, password_hash, name, role, is_active, plan_tier, studio_id)
values (
  'superadmin@dev.local',
  's1$kIeyQK0OOX79vXAWZqrsPg$uEJkpx4Hm6-1WtP_gr4-HiVUnFBhjRR-HfrjIROa3L4',
  'Super Admin Platform',
  'platform_admin',
  true,
  null,
  null
)
on conflict (email) do update
set role = 'platform_admin', is_active = true, studio_id = null;

-- 5. Add studio_id to clients table
alter table clients add column if not exists studio_id uuid references studios(id) on delete cascade;
create index if not exists idx_clients_studio on clients(studio_id);

-- Backfill studio_id for existing clients from their PT
update clients c
set studio_id = u.studio_id
from users u
where c.pt_id = u.id and c.studio_id is null;

update clients
set studio_id = '00000000-0000-0000-0000-000000000001'
where studio_id is null;

-- 6. Add studio_id to exercise_categories and exercise_library (nullable = global master template)
alter table exercise_categories add column if not exists studio_id uuid references studios(id) on delete cascade;
alter table exercise_library add column if not exists studio_id uuid references studios(id) on delete cascade;
create index if not exists idx_exercise_lib_studio on exercise_library(studio_id);
