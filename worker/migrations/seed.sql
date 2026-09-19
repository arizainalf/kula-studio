-- seed.sql — data dummy untuk dev (jalankan setelah 0001_init.sql)
-- Password semua akun: "devpass123" (hash scrypt di-generate oleh Worker saat runtime test;
-- untuk seed statis pakai hash di bawah — dihasilkan sekali oleh script node)
-- Run: node worker/scripts/hash-seed.js lalu sesuaikan, atau generate via API invite saat runtime.

-- Placeholder: hash untuk "devpass123"
INSERT INTO users (email, password_hash, name, role, is_active, plan_tier, expires_at) VALUES
  ('admin@dev.local',  's1$kIeyQK0OOX79vXAWZqrsPg$uEJkpx4Hm6-1WtP_gr4-HiVUnFBhjRR-HfrjIROa3L4', 'Admin Dev',  'admin_studio',   true,  NULL,        NULL),
  ('boss@dev.local',   's1$kIeyQK0OOX79vXAWZqrsPg$uEJkpx4Hm6-1WtP_gr4-HiVUnFBhjRR-HfrjIROa3L4', 'Manager Dev','manager', true,  NULL,        NULL),
  ('hadi@dev.local',   's1$kIeyQK0OOX79vXAWZqrsPg$uEJkpx4Hm6-1WtP_gr4-HiVUnFBhjRR-HfrjIROa3L4', 'Hadi PT',    'pt',      true,  'standard',  CURRENT_DATE + 30),
  ('expi@dev.local',   's1$kIeyQK0OOX79vXAWZqrsPg$uEJkpx4Hm6-1WtP_gr4-HiVUnFBhjRR-HfrjIROa3L4', 'Expired PT', 'pt',      true,  'pro',       CURRENT_DATE - 2);

INSERT INTO staff_profile (user_id, manager_id, spec)
SELECT id, (SELECT id FROM users WHERE email='boss@dev.local'), 'General Fitness'
FROM users WHERE email IN ('hadi@dev.local','expi@dev.local');

INSERT INTO clients (pt_id, name, goal, pkg_total, phone, gender, problem) VALUES
  ((SELECT id FROM users WHERE email='hadi@dev.local'), 'Siti Rahma',          'fat_loss',    35, '628111111111', 'wanita', 'none'),
  ((SELECT id FROM users WHERE email='hadi@dev.local'), 'Fajar Satria',        'muscle_gain', 40, '628122222222', 'pria',  'none'),
  ((SELECT id FROM users WHERE email='hadi@dev.local'), 'Widhi Susila Utama',  'fat_loss',    40, NULL,           'pria',  'knee'),
  ((SELECT id FROM users WHERE email='hadi@dev.local'), 'Fariha',              'fat_loss',    35, NULL,           'wanita', 'back');

INSERT INTO sessions (client_id, pt_id, date, rpe, weight, fat_pct, exercises, notes) VALUES
  ((SELECT id FROM clients WHERE name='Siti Rahma'), (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE - 14, 7, 68.5, 32.1,
   '[{"warmup":[{"name":"Dynamic Stretch","detail":"10 mnt"}],"resistance":[{"name":"Leg Press","detail":"3x12 40kg"},{"name":"Row","detail":"3x10 25kg"}],"cardio":[{"name":"Treadmill","detail":"20 mnt jalan cepat"}],"cooldown":[{"name":"Static Stretch","detail":"5 mnt"}]}']', 'Sesi perdana'),
  ((SELECT id FROM clients WHERE name='Siti Rahma'), (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE - 7, 8, 67.2, 31.4,
   '[{"warmup":[{"name":"Jumping Jack","detail":"3x30"}],"resistance":[{"name":"Goblet Squat","detail":"3x12 16kg"}],"cardio":[{"name":"Elliptical","detail":"15 mnt"}],"cooldown":[]}']', 'Progress bagus'),
  ((SELECT id FROM clients WHERE name='Siti Rahma'), (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE - 1, 6, 66.0, 30.8,
   '[{"warmup":[],"resistance":[{"name":"Deadlift","detail":"3x8 50kg"}],"cardio":[{"name":"Bike","detail":"10 mnt"}],"cooldown":[{"name":"Foam Roller","detail":"5 mnt"}]}']', NULL),
  ((SELECT id FROM clients WHERE name='Fajar Satria'), (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE - 5, 9, 78.0, 18.0,
   '[{"warmup":[],"resistance":[{"name":"Bench Press","detail":"4x8 60kg"},{"name":"Pull Up","detail":"4x6"}],"cardio":[],"cooldown":[]}']', 'PR bench!');

INSERT INTO schedule (client_id, pt_id, date, time, note) VALUES
  ((SELECT id FROM clients WHERE name='Siti Rahma'),   (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE,     '07:00', 'Sesi pagi'),
  ((SELECT id FROM clients WHERE name='Siti Rahma'),   (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE + 2, '17:30', NULL),
  ((SELECT id FROM clients WHERE name='Fajar Satria'), (SELECT id FROM users WHERE email='hadi@dev.local'), CURRENT_DATE + 1, '19:00', 'Fokus push');
