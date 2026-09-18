export interface Env {
  ENV?: string;
  // Supabase Postgres (pooler) — set via `wrangler secret put` / .dev.vars
  DATABASE_URL: string;
  // Session signing
  SESSION_SECRET: string;
  // R2 (foto) — dipakai mulai Fase 5
  PHOTOS_BUCKET?: R2Bucket;
}
