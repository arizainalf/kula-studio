alter table photos add column if not exists pt_id uuid references users(id) on delete cascade;
create index if not exists idx_photos_pt on photos(pt_id);
