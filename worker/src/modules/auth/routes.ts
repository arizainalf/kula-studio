import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { verifyPassword, signToken } from '../../lib/auth';
import { requireAuth } from '../../middleware/auth';
import type { Env } from '../../env';

const auth = new Hono<{ Bindings: Env }>();

const loginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(6).max(100),
});

auth.post('/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const [user] = await db(c.env)`
    select id, email, password_hash, name, role, is_active, plan_tier, expires_at
    from users where email = ${parsed.data.email}`;

  // Pesan generik — jangan bocorkan email terdaftar
  if (!user || !verifyPassword(parsed.data.password, user.password_hash))
    return c.json({ error: 'invalid_credentials' }, 401);
  if (!user.is_active) return c.json({ error: 'pending_activation' }, 403);

  const payload = {
    sub: {
      id: user.id, email: user.email, role: user.role, name: user.name,
      plan_tier: user.plan_tier, expires_at: user.expires_at,
    },
    exp: Date.now() + 7 * 86400_000,
  };
  const token = signToken(payload, c.env.SESSION_SECRET);
  c.header(
    'Set-Cookie',
    `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`,
  );
  return c.json({ user: payload.sub });
});

auth.post('/logout', (c) => {
  c.header('Set-Cookie', 'tl_session=; HttpOnly; Secure; Path=/; Max-Age=0');
  return c.json({ ok: true });
});

auth.get('/me', requireAuth, (c) => c.json({ user: c.get('user') }));

export default auth;
