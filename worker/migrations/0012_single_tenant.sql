-- ============================================================
-- 0012_single_tenant.sql
-- MIGRATION: Multi-tenant → Single-tenant (admin, pt, client)
-- ============================================================

-- 1. Drop batasan role lama
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Update role legacy: 'platform_admin' & 'admin_studio' → 'admin'
UPDATE users SET role = 'admin' WHERE role IN ('platform_admin', 'admin_studio');

-- 3. Update role legacy: 'manager' → 'pt'
UPDATE users SET role = 'pt' WHERE role = 'manager';

-- 4. Pasang constraint role baru: hanya 'admin' dan 'pt' untuk tabel users
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'pt'));

-- 5. Hapus kolom multi-tenant dari users
ALTER TABLE users DROP COLUMN IF EXISTS studio_id;
ALTER TABLE users DROP COLUMN IF EXISTS plan_tier;
ALTER TABLE users DROP COLUMN IF EXISTS expires_at;

-- 6. Hapus kolom multi-tenant dari clients
ALTER TABLE clients DROP COLUMN IF EXISTS studio_id;

-- 7. Hapus kolom multi-tenant dari exercise_library
ALTER TABLE exercise_library DROP COLUMN IF EXISTS studio_id;

-- 8. Hapus relasi manager dari staff_profile
ALTER TABLE staff_profile DROP COLUMN IF EXISTS manager_id;

-- 9. Hapus tabel studios (cascade ke relasi lama jika ada)
DROP TABLE IF EXISTS studios CASCADE;

-- 10. platform_settings tetap dipertahankan untuk Landing Page & Pengaturan Platform
