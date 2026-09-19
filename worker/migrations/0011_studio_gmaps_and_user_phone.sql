-- 0011_studio_gmaps_and_user_phone.sql
-- 1. Kolom nomor telepon / WhatsApp pada akun PT / staf
alter table users add column if not exists phone text;

-- 2. Kolom URL Google Maps pada entitas studio gym
alter table studios add column if not exists gmaps_url text;

-- 3. Inisialisasi data demo (opsional)
update users
set phone = '6287884241516'
where role = 'pt' and (phone is null or trim(phone) = '') and (email = 'hadi@dev.local' or name ilike '%hadi%');

update studios
set gmaps_url = 'https://maps.google.com/?q=FitZone+Studio+Jakarta'
where gmaps_url is null or trim(gmaps_url) = '';
