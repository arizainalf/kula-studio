-- 0007_user_avatar.sql — Add avatar_url to users and clients
alter table users add column if not exists avatar_url text;
alter table clients add column if not exists avatar_url text;
