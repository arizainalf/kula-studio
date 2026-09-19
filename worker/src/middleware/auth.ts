import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyToken } from '../lib/auth';
import type { Env } from '../env';

export interface SessionUser {
  id: string;
  email: string;
  role: 'platform_admin' | 'admin_studio' | 'manager' | 'pt' | 'client';
  name: string;
  plan_tier?: 'standard' | 'pro' | null;
  expires_at?: string | null;
  studio_id?: string | null;
  studio_name?: string | null;
  studio_slug?: string | null;
  clientId?: string;
  phone?: string | null;
  pt_id?: string;
  pt_name?: string | null;
  avatar_url?: string | null;
  youtube_url?: string | null;
}

const GRACE_DAYS = 14;

export function accessState(u: SessionUser): 'active' | 'grace' | 'locked' {
  if (u.role === 'client' || u.role === 'platform_admin') return 'active';
  if (!u.expires_at) return 'active';
  // ISO dari Postgres date bisa "2026-09-16" atau "2026-09-16T00:00:00.000Z" — ambil 10 char pertama
  const day = u.expires_at.slice(0, 10);
  const exp = new Date(day + 'T23:59:59Z').getTime();
  const days = (Date.now() - exp) / 86400_000;
  if (days <= 0) return 'active';
  return days <= GRACE_DAYS ? 'grace' : 'locked';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser;
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const token =
    getCookie(c, 'ks_session') ||
    getCookie(c, 'kulastudio_session') ||
    getCookie(c, 'tl_session') ||
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);
  const payload = verifyToken<{ sub: SessionUser; exp: number }>(token, c.env.SESSION_SECRET);
  if (!payload || payload.exp < Date.now()) return c.json({ error: 'unauthorized' }, 401);
  if (accessState(payload.sub) === 'locked') return c.json({ error: 'account_locked' }, 403);
  c.set('user', payload.sub);
  await next();
}
export function requireRole(...roles: SessionUser['role'][]) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const u = c.get('user');
    if (!u || !roles.includes(u.role)) return c.json({ error: 'forbidden' }, 403);
    await next();
  };
}

// Grace: akun expired ≤14 hari → hanya GET. Dipasang setelah requireAuth.
export async function rejectGraceWrite(c: Context<{ Bindings: Env }>, next: Next) {
  const u = c.get('user');
  if (u && c.req.method !== 'GET' && accessState(u) === 'grace') {
    return c.json({ error: 'read_only_grace' }, 403);
  }
  await next();
}
