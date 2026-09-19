-- 0008_platform_settings.sql — Dynamic Platform & Landing Page Identity Config

create table if not exists platform_settings (
  id text primary key default 'default',
  app_name text not null default 'TrainLog',
  app_tagline text not null default 'Pro PT Manager',
  app_initials text not null default 'TL',
  hero_pill text not null default 'Eksklusif untuk Personal Trainer & Studio',
  hero_headline text not null default 'Catat Sesi. Susun Program NASM.',
  hero_gradient text not null default 'Pantau Progress Klien.',
  hero_subheadline text not null default 'Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal, mencatat beban & RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.',
  features jsonb not null default '[]'::jsonb,
  how_it_works jsonb not null default '[]'::jsonb,
  pricing_plans jsonb not null default '[]'::jsonb,
  long_term_plans jsonb not null default '[]'::jsonb,
  contact_whatsapp text not null default '6287884241516',
  contact_email text not null default 'support@trainlog.id',
  cta_headline text not null default 'Mulai Catat Sesi Latihan Hari Ini.',
  cta_subheadline text not null default 'Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.',
  footer_copyright text not null default 'TrainLog Replica. Hak Cipta Dilindungi.',
  updated_at timestamptz default now()
);

-- Seed default initial row
insert into platform_settings (
  id,
  app_name,
  app_tagline,
  app_initials,
  hero_pill,
  hero_headline,
  hero_gradient,
  hero_subheadline,
  features,
  how_it_works,
  pricing_plans,
  long_term_plans,
  contact_whatsapp,
  contact_email,
  cta_headline,
  cta_subheadline,
  footer_copyright
) values (
  'default',
  'TrainLog',
  'Pro PT Manager',
  'TL',
  'Eksklusif untuk Personal Trainer & Studio',
  'Catat Sesi. Susun Program NASM.',
  'Pantau Progress Klien.',
  'Tinggalkan buku catatan kertas dan spreadsheet yang tercecer. Satu platform terpadu untuk mengatur jadwal, mencatat beban & RPE, merancang program berbasis sains, dan membagikan rekap sesi ke WhatsApp klien.',
  '[
    {
      "id": "f1",
      "title": "Manajemen Profil Klien",
      "description": "Kelola profil klien lengkap dengan target kebugaran (Fat Loss, Muscle Gain, General Fitness), nomor WhatsApp, paket kuota sesi, dan catatan kondisi fisik khusus.",
      "icon": "users"
    },
    {
      "id": "f2",
      "title": "Log Sesi 4 Fase Terstruktur",
      "description": "Pencatatan sesi sesuai standar internasional: Warm-Up, Resistance, Cardio, dan Cool-Down dengan data set, repetisi, beban (kg), dan slider skala intensitas RPE 1–10.",
      "icon": "clipboard"
    },
    {
      "id": "f3",
      "title": "Generate Program NASM (AI)",
      "description": "Rancang program latihan komprehensif berbasis metodologi NASM OPT Model bertenaga kecerdasan buatan, disesuaikan dengan usia, jenis kelamin, serta riwayat cedera sendi.",
      "icon": "zap"
    },
    {
      "id": "f4",
      "title": "Jadwal Kalender Mingguan",
      "description": "Tampilan jadwal per jam (05:00–23:00) yang rapi untuk 7 hari dalam sepekan. Cegah bentrok jadwal sesi personal training dan pantau slot waktu kosong dengan mudah.",
      "icon": "calendar"
    },
    {
      "id": "f5",
      "title": "Grafik & Foto Progres Klien",
      "description": "Pantau grafik penurunan berat badan, perubahan RPE rata-rata, dan galeri foto transformasi klien yang tersimpan rapi dan aman di cloud storage.",
      "icon": "chart"
    },
    {
      "id": "f6",
      "title": "Export PDF & WhatsApp Share",
      "description": "Cetak riwayat latihan langsung ke format PDF elegan atau kirimkan pesan ringkasan latihan harian langsung ke nomor WhatsApp klien dengan satu ketukan.",
      "icon": "share"
    }
  ]'::jsonb,
  '[
    {
      "id": "s1",
      "step": "01",
      "title": "Tambahkan Profil Klien",
      "description": "Masukkan nama klien, target latihan, dan jumlah paket sesi yang diambil. Sistem akan mengawasi kuota sesi otomatis."
    },
    {
      "id": "s2",
      "step": "02",
      "title": "Catat Saat Latihan Berlangsung",
      "description": "Gunakan smartphone saat mendampingi klien di gym. Masukkan beban, repetisi, dan RPE dalam hitungan detik."
    },
    {
      "id": "s3",
      "step": "03",
      "title": "Kirim Rekap & Evaluasi",
      "description": "Kirimkan ringkasan latihan ke WhatsApp klien dan evaluasi grafik kemajuan beban dari waktu ke waktu."
    }
  ]'::jsonb,
  '[
    {
      "id": "p1",
      "name": "Standard",
      "badge": "Dasar",
      "price": "Rp59.000",
      "period": "/ bulan",
      "description": "Cocok untuk personal trainer yang fokus pada pencatatan harian yang cepat, akurat, dan pelaporan rapi.",
      "features": [
        "Manajemen Klien & Sesi Unlimited",
        "Kalender Jadwal Mingguan",
        "Foto & Grafik Progress Klien",
        "Session Template Rutin",
        "Sinkronisasi Cloud Otomatis",
        "Kuota Generate AI Terbatas"
      ],
      "button_text": "Pilih Standard",
      "button_link": "/login",
      "is_popular": false
    },
    {
      "id": "p2",
      "name": "Pro",
      "badge": "Paling Diminati",
      "price": "Rp89.000",
      "period": "/ bulan",
      "description": "Solusi komprehensif bagi pelatih elit yang memanfaatkan kekuatan AI berbasis metodologi sains NASM.",
      "features": [
        "Seluruh Fitur Paket Standard",
        "Generate Program NASM Tanpa Batas",
        "Kustomisasi & Modifikasi Gerakan Instan",
        "Export PDF Bersih Tanpa Watermark",
        "Prioritas Dukungan Admin Langsung via WA"
      ],
      "button_text": "Mulai Paket Pro",
      "button_link": "/login",
      "is_popular": true
    }
  ]'::jsonb,
  '[
    {
      "id": "lt1",
      "title": "1 Bulan",
      "price": "Rp89.000",
      "description": "Fleksibel bulanan, berhenti kapan saja.",
      "is_highlight": false
    },
    {
      "id": "lt2",
      "title": "3 Bulan (Hemat 10%)",
      "price": "Rp239.000",
      "description": "Setara Rp79.600 / bulan. Hemat Rp28.000.",
      "is_highlight": false
    },
    {
      "id": "lt3",
      "title": "6 Bulan (Bayar 5, Dapat 6)",
      "price": "Rp445.000",
      "description": "Setara Rp74.200 / bulan. Hemat Rp89.000.",
      "is_highlight": true
    }
  ]'::jsonb,
  '6287884241516',
  'support@trainlog.id',
  'Mulai Catat Sesi Latihan Hari Ini.',
  'Daftarkan akun Anda, verifikasi melalui admin studio, dan rasakan kemudahan pengelolaan latihan berstandar internasional.',
  'TrainLog Replica. Hak Cipta Dilindungi.'
)
on conflict (id) do nothing;
