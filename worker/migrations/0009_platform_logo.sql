-- 0009_platform_logo.sql — Add logo_url to platform_settings
alter table platform_settings add column if not exists logo_url text default null;
