import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const staff = new Hono<{ Bindings: Env }>();
staff.use('*', requireAuth, rejectGraceWrite);

// Manager mengundang PT: buat user (is_active true, password dari manager) + staff_profile
const inviteSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
  spec: z.string().max(100).optional(),
  plan_tier: z.enum(['standard', 'pro']).default('standard'),
  expires_at: z.string().date().nullable().default(null),
});

staff.post('/invite', requireRole('manager', 'admin'), async (c) => {
  const parsed = inviteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const inviter = c.get('user');
  if (inviter.email === parsed.data.email) return c.json({ error: 'self_invite' }, 400);

  const sql = db(c);
  const exists = await sql`select 1 from users where email = ${parsed.data.email}`;
  if (exists.length) return c.json({ error: 'email_taken' }, 409);

  const [pt] = await sql`
    insert into users (email, password_hash, name, role, is_active, plan_tier, expires_at)
    values (${parsed.data.email}, ${hashPassword(parsed.data.password)}, ${parsed.data.name},
            'pt', true, ${parsed.data.plan_tier}, ${parsed.data.expires_at})
    returning id, email, name, role, plan_tier, expires_at, created_at`;

  await sql`
    insert into staff_profile (user_id, manager_id, spec)
    values (${pt.id}, ${inviter.role === 'manager' ? inviter.id : null}, ${parsed.data.spec ?? null})`;

  return c.json({ pt }, 201);
});

// Daftar staff PT di bawah manager (atau semua untuk admin)
staff.get('/', requireRole('manager', 'admin'), async (c) => {
  const u = c.get('user');
  const sql = db(c);
  const rows = u.role === 'admin'
    ? await sql`select u.id, u.email, u.name, u.plan_tier, u.expires_at, u.is_active, sp.manager_id, sp.spec
                from users u left join staff_profile sp on sp.user_id = u.id
                where u.role = 'pt' order by u.created_at desc`
    : await sql`select u.id, u.email, u.name, u.plan_tier, u.expires_at, u.is_active, sp.manager_id, sp.spec
                from users u join staff_profile sp on sp.user_id = u.id
                where sp.manager_id = ${u.id} order by u.created_at desc`;
  return c.json({ staff: rows });
});

// Ubah tier/expiry PT (manager pemilik / admin)
const patchSchema = z.object({
  plan_tier: z.enum(['standard', 'pro']).optional(),
  expires_at: z.string().date().nullable().optional(),
  is_active: z.boolean().optional(),
});

staff.patch('/:id', requireRole('manager', 'admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const id = c.req.param('id') as string;
  const { plan_tier, expires_at, is_active } = parsed.data;
  if (!plan_tier && !expires_at && is_active === undefined)
    return c.json({ error: 'empty_update' }, 400);

  const u = c.get('user');
  const sql = db(c);
  if (u.role === 'manager') {
    const owns = await sql`select 1 from staff_profile where user_id = ${id} and manager_id = ${u.id}`;
    if (!owns.length) return c.json({ error: 'forbidden' }, 403);
  }

  const [row] = await sql`
    update users set
      plan_tier = coalesce(${plan_tier ?? null}, plan_tier),
      expires_at = coalesce(${expires_at ?? null}, expires_at),
      is_active = coalesce(${is_active ?? null}, is_active)
    where id = ${id} and role = 'pt'
    returning id, email, name, plan_tier, expires_at, is_active`;
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ pt: row });
});

export default staff;
