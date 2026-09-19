-- 0003_client_email.sql — Add email column to clients for client portal login
alter table clients add column if not exists email text;
create index if not exists idx_clients_email on clients(lower(email));
