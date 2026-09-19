-- 0004_exercise_tables.sql — Exercise categories and Exercise library

create table if not exists exercise_categories (
  slug        text primary key,
  name        text not null,
  description text,
  icon        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists exercise_library (
  id             uuid primary key default gen_random_uuid(),
  pt_id          uuid references users(id) on delete cascade,
  category_slug  text not null references exercise_categories(slug) on delete cascade,
  name           text not null,
  default_detail text,
  muscle_group   text,
  is_favorite    boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists idx_exercise_library_cat on exercise_library(category_slug, pt_id, name);
