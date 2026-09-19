-- 0010_user_youtube_url.sql — Add youtube_url to users table for PT video showcase on landing page
alter table users add column if not exists youtube_url text;
