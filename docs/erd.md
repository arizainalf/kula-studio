# ERD — TrainLog Replica (Redisain Relasional)

Pengembangan dari `erd-asli.md` (rekonstruksi TrainLog asli, document-store). Di sini dipecah jadi tabel relasional Postgres dengan FK — menghilangkan write row-penuh + optimistic lock.

## Diagram

```mermaid
erDiagram
    USERS ||--o{ STAFF_PROFILE : "punya"
    USERS ||--o{ SESSIONS_AUTH : "session token"

    USERS {
        uuid id PK
        text email UK "unique, lowercase"
        text password_hash "argon2id"
        text name
        text role "admin | manager | pt"
        bool is_active "default false — menunggu approval admin"
        text plan_tier "standard | pro (role=pt saja)"
        date expires_at "null = unlimited"
        timestamptz created_at
    }

    STAFF_PROFILE {
        uuid user_id PK,FK "→ users.id (role=pt)"
        uuid manager_id FK "→ users.id (role=manager), null jika independen"
        text spec "spesialisasi PT"
    }

    CLIENTS ||--o{ SESSIONS : "riwayat"
    CLIENTS ||--o{ SCHEDULE : "jadwal"
    CLIENTS ||--o{ PHOTOS : "foto progress"

    USERS ||--o{ CLIENTS : "pt_id (owner)"

    CLIENTS {
        uuid id PK
        uuid pt_id FK "→ users.id (role=pt)"
        text name
        text goal "fat_loss | muscle_gain | general"
        int pkg_total "jumlah sesi paket"
        text phone
        text notes
        text age_bracket
        text gender "pria | wanita"
        bool pregnant "default false"
        text problem "none | knee | back | shoulder"
        bool is_active "default true"
        timestamptz created_at
    }

    SESSIONS {
        uuid id PK
        uuid client_id FK "→ clients.id, ON DELETE CASCADE"
        uuid pt_id FK "→ users.id"
        date date
        int rpe "1-10, CHECK"
        numeric weight "kg, nullable"
        numeric fat_pct "nullable"
        jsonb exercises "{warmup[],resistance[],cardio[],cooldown[]}"
        text notes
        timestamptz created_at
    }

    SCHEDULE {
        uuid id PK
        uuid client_id FK "→ clients.id, ON DELETE CASCADE"
        uuid pt_id FK "→ users.id"
        date date
        time time
        text note
    }

    PHOTOS {
        uuid id PK
        uuid client_id FK "→ clients.id, ON DELETE CASCADE"
        uuid session_id FK "→ sessions.id, nullable"
        text r2_key "path di bucket"
        timestamptz created_at
    }
```

## Index (WAJIB sebelum tunjangan read habis)

```sql
CREATE INDEX idx_clients_pt      ON clients(pt_id);
CREATE INDEX idx_sessions_client ON sessions(client_id, date DESC);
CREATE INDEX idx_sessions_pt     ON sessions(pt_id, date DESC);
CREATE INDEX idx_schedule_range  ON schedule(pt_id, date);
CREATE INDEX idx_photos_client   ON photos(client_id);
```

## Aturan akses (lapisan Hono, pengganti RLS)

1. **Ownership**: semua query bawa `WHERE pt_id = currentUser.id` — kecuali:
2. **Manager**: boleh read semua PT dengan `staff_profile.manager_id = manager.id`; write tetap milik PT
3. **Admin**: read semua
4. **Grace mode**: `expires_at < now()` dan `≤ 14 hari` → hanya GET; > 14 hari → 402/tolak login
5. **Aktivasi**: `is_active = false` → login ditolak dengan pesan "menunggu verifikasi"

## Kenapa beda dari aslinya

| Asli (JSONB 1-row) | Replica (relasional) |
|---|---|
| Write = upsert row penuh (ratusan KB) | Write = 1 row yang berubah |
| Optimistic lock manual `updated_at` | FK + constraint DB |
| Query lintas akun = fetch semua row | SQL join biasa |
| Duplikasi data PT di row manager | `manager_id` tunggal |
| Boro row read (PostgREST count all) | Query terindeks presisi |
