# ERD TrainLog

Direkonstruksi dari kode app (`app_trainlog.id`, analisa 2026-09-18). Bukan skema SQL asli — `trainlog_data` memakai pola **document/JSONB** (array objek dalam 1 row per akun), relasi antar-entity lewat `id` di dalam JSON.

## Diagram (Mermaid)

```mermaid
erDiagram
    AUTH_USERS ||--o| TRAINLOG_WHITELIST : "email"
    AUTH_USERS ||--o| TRAINLOG_ADMINS : "email"
    AUTH_USERS ||--o| TRAINLOG_DATA : "email (owner)"
    TRAINLOG_ADMINS {
        text email PK
        text name
        text added_by
        timestamptz added_at
    }
    TRAINLOG_WHITELIST {
        text email PK
        text name
        text role "admin|manager|pt"
        text manager_email FK "→ whitelist.email (role=manager)"
        text pt_id "→ trainlog_data.pts[].id"
        text added_by
        bool is_active
        bool pending_approval
        date expires_at
        text plan_tier "standard|pro"
        int gen_count "kuota generate terpakai"
    }
    TRAINLOG_DATA {
        text email PK "owner akun (manager/PT)"
        jsonb pts "array PT"
        jsonb clients "array client"
        jsonb sessions "array sesi"
        timestamptz updated_at "optimistic lock"
    }
    TRAINLOG_SETTINGS {
        text key PK "gen_quota_standard | admin_wa"
        text value
        timestamptz updated_at
        text updated_by
    }
    STORAGE_PHOTOS {
        text bucket "session-photos"
        text path "email/timestamp.jpg"
    }

    TRAINLOG_DATA ||--o{ PT : "pts[]"
    PT {
        text id PK
        text name
        text spec
        text email
        bool pendingApproval
        jsonb schedule "[]"
    }
    PT ||--o{ SCHEDULE : "schedule[]"
    SCHEDULE {
        text id PK
        text clientId FK "→ client.id"
        date date
        text time
        text note
    }
    PT ||--o{ CLIENT : "milik"
    CLIENT {
        text id PK
        text ptId FK "→ pt.id"
        text name
        text goal "Fat Loss|Muscle Gain|General Fitness"
        int pkg "total sesi paket"
        text notes
        text phone "utk WA"
        text ageBracket
        text gender "pria|wanita"
        bool pregnant
        text problem "none|knee|back|shoulder"
        bool isActive
    }
    CLIENT ||--o{ SESSION : "riwayat"
    SESSION {
        text id PK
        text clientId FK "→ client.id"
        text ptId FK "→ pt.id"
        date date
        float weight
        float fatKg
        float fatPct
        jsonb ex "warmup/resistance/cardio/cooldown[]"
        int rpe "1-10"
        text notes
        text photos "[] → storage"
    }
    SESSION ||--o{ EXERCISE : "ex{}"
    EXERCISE {
        text name
        text detail "set/rep/beban"
    }
    PT ||--o{ TRAINLOG_DATA : "embed di row owner"
```

## Versi teks (tanpa Mermaid)

```
auth.users (Supabase Auth)
   email ──1:1── trainlog_whitelist        (akses: role, tier, expiry, aktif)
   email ──1:1── trainlog_admins           (superuser)
   email ──1:1── trainlog_data             (row data milik akun)

trainlog_data (1 row per akun manager/PT)
 ├─ pts[]      : PT      {id, name, spec, email, pendingApproval, schedule[]}
 ├─ clients[]  : Client  {id, ptId→pts[].id, name, goal, pkg, notes, phone,
 │                        ageBracket, gender, pregnant, problem, isActive}
 └─ sessions[] : Session {id, clientId→clients[].id, ptId→pts[].id, date,
                          weight, fatKg, fatPct, rpe, notes,
                          ex{warmup[],resistance[],cardio[],cooldown[]},
                          photos[] → storage bucket "session-photos"}

trainlog_whitelist
 ├─ manager_email → trainlog_whitelist.email (role=manager)
 └─ pt_id         → trainlog_data.pts[].id

trainlog_settings : {key: gen_quota_standard|admin_wa, value, updated_at, updated_by}

Storage: bucket session-photos, path = <owner-email>/<ts>_<rand>.jpg
Edge Functions: create-account, change-email, ai-proxy, generate-program
```

## Catatan desain

- **Document-store di atas RDBMS**: seluruh bisnis data (PT/client/sesi/jadwal) disimpan sebagai 3 array JSONB dalam 1 row per akun. Write = upsert row penuh + `updated_at` sebagai optimistic lock. Sederhana (tanpa join/migrasi), tapi: row membesar linear dengan jumlah sesi, konflik tulis = last-write-wins per akun, tidak bisa query lintas akun via PostgREST (dilakukan di client).
- **Relasi nyata hanya via email**: auth ↔ whitelist ↔ data ↔ admins. `manager_email` di whitelist = hierarki manager→PT.
- **Foto tidak di tabel** — hanya nama path di `session.photos[]`, file di Supabase Storage.
- Jadwal menempel di objek PT (`pt.schedule[]`), bukan entity tabel terpisah.
- Kalau mau desain ulang relasional: pecah `pts/clients/sessions/schedule` jadi tabel sendiri dengan FK + RLS per `owner_email` — hilangkan optimistic-lock row penuh.
