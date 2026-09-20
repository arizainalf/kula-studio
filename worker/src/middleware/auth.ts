import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyToken } from '../lib/auth';
import type { Env } from '../env';

export interface SessionUser {
  id: string;
  email: string;
  role: 'admin' | 'pt' | 'client';
  name: string;
  clientId?: string;
  phone?: string | null;
  pt_id?: string;
  pt_name?: string | null;
  avatar_url?: string | null;
  youtube_url?: string | null;
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
  c.set('user', payload.sub);
  await next();
}
export type Role = SessionUser['role'];

export function requireRole(...roles: Role[]) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const u = c.get('user');
    if (!u || !roles.includes(u.role)) return c.json({ error: 'forbidden' }, 403);
    await next();
  };
}

// Dipertahankan untuk kompatibilitas (selalu pass di single-tenant)
export async function rejectGraceWrite(c: Context<{ Bindings: Env }>, next: Next) {
  await next();
}

