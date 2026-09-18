-- 0001_init.sql — TrainLog replica: users, staff_profile, clients, sessions, schedule, photos
create extension if not exists "pgcrypto";

create table users (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique check (email = lower(email)),
  password_hash text not null,
  name         text not null,
  role         text not null check (role in ('admin','manager','pt')),
  is_active    boolean not null default false,
  plan_tier    text check (role <> 'pt' or plan_tier in ('standard','pro')),
  expires_at   date,
  created_at   timestamptz not null default now()
);

create table staff_profile (
  user_id    uuid primary key references users(id) on delete cascade,
  manager_id uuid references users(id) on delete set null,
  spec       text
);

create table clients (
  id          uuid primary key default gen_random_uuid(),
  pt_id       uuid not null references users(id) on delete cascade,
  name        text not null,
  goal        text not null default 'general' check (goal in ('fat_loss','muscle_gain','general')),
  pkg_total   int not null default 0 check (pkg_total >= 0),
  phone       text,
  notes       text,
  age_bracket text,
  gender      text check (gender in ('pria','wanita')),
  pregnant    boolean not null default false,
  problem     text not null default 'none' check (problem in ('none','knee','back','shoulder')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table sessions (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  pt_id      uuid not null references users(id) on delete cascade,
  date       date not null,
  rpe        int check (rpe between 1 and 10),
  weight     numeric(5,1),
  fat_pct    numeric(4,1),
  exercises  jsonb not null default '{}'::jsonb,
  notes      text,
  created_at timestamptz not null default now()
);

create table schedule (
  id        uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  pt_id     uuid not null references users(id) on delete cascade,
  date      date not null,
  time      time not null,
  note      text
);

create table photos (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  r2_key     text not null,
  created_at timestamptz not null default now()
);

create index idx_clients_pt      on clients(pt_id);
create index idx_sessions_client on sessions(client_id, date desc);
create index idx_sessions_pt     on sessions(pt_id, date desc);
create index idx_schedule_range  on schedule(pt_id, date);
create index idx_photos_client   on photos(client_id);
