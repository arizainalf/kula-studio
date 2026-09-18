# Struktur Modular Monolith — Worker (BE)

Prinsip sama dengan ulem: satu deployable, kode terpecah per domain module. Route mounting terpusat di `src/index.ts`, domain tidak saling import (kecuali lewat types/lib bersama).

```
worker/
├─ migrations/                  # SQL migrasi Supabase (0001_init.sql, 0002_*.sql, ...)
├─ src/
│  ├─ index.ts                  # entry: mount semua module, error handler global
│  ├─ env.ts                    # tipe Env (bindings, secrets) — satu sumber
│  ├─ lib/
│  │  ├─ db.ts                  # koneksi Postgres Supabase (pooler), helper query
│  │  ├─ auth.ts                # hash password, sign/verify session token, cookie
│  │  └─ http.ts                # helper response, zod validate wrapper
│  ├─ middleware/
│  │  └─ auth.ts                # requireAuth, requireRole('admin'|'manager'|'pt'), grace/read-only guard
│  └─ modules/
│     ├─ auth/
│     │  └─ routes.ts           # POST /auth/login, /auth/logout, GET /auth/me
│     ├─ staff/                 # domain: manager ↔ PT (undang, approval, tier)
│     │  ├─ routes.ts           # POST /staff/invite, GET /staff, PATCH /staff/:id
│     │  └─ service.ts          # logika: buat user PT + staff_profile, set tier/expiry
│     ├─ clients/
│     │  ├─ routes.ts           # CRUD /clients + ownership check
│     │  └─ service.ts
│     ├─ sessions/
│     │  ├─ routes.ts           # CRUD /clients/:id/sessions (nested), pagination keyset
│     │  └─ service.ts
│     ├─ schedule/
│     │  ├─ routes.ts           # CRUD /schedule?from=&to=
│     │  └─ service.ts
│     └─ photos/
│        ├─ routes.ts           # POST /photos (presign R2), GET /photos/:client
│        └─ service.ts
├─ wrangler.jsonc
└─ tsconfig.json
```

## Aturan dependensi

```
index.ts  → modules/*   (mount)
modules/* → lib/*, middleware/*   (saja)
modules/x ↛ modules/y   (domain tidak import domain lain; kalau butuh → naik ke service di module yang punya data, atau lib/)
```

## Alur request

```
request → index.ts (Hono app)
        → middleware/auth.ts   (decode session, inject c.var.user, cek role/grace)
        → modules/<domain>/routes.ts  (zod validasi body)
        → modules/<domain>/service.ts (logika + ownership WHERE)
        → lib/db.ts (query Postgres)
```
