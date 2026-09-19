-- 0006_rename_admin_to_admin_studio.sql — Rename 'admin' role to 'admin_studio'

-- 1. Migrate all existing 'admin' users to 'admin_studio'
update users set role = 'admin_studio' where role = 'admin';

-- 2. Drop existing role constraint and recreate with 'admin_studio'
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('platform_admin', 'admin_studio', 'manager', 'pt'));
