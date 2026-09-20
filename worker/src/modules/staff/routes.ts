import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const staff = new Hono<{ Bindings: Env }>();
staff.use('*', requireAuth, rejectGraceWrite);

// Admin mengundang PT atau admin lain
const inviteSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'pt']).default('pt'),
  phone: z.string().max(30).optional().nullable(),
  spec: z.string().max(100).optional(),
  avatar_url: z.string().max(2000000).optional().nullable(),
  youtube_url: z.string().max(500).optional().nullable(),
});

staff.post('/invite', requireRole('admin'), async (c) => {
  const parsed = inviteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const inviter = c.get('user');
  if (inviter.email === parsed.data.email) return c.json({ error: 'self_invite' }, 400);

  const sql = db(c);
  const exists = await sql`select 1 from users where email = ${parsed.data.email}`;
  if (exists.length) return c.json({ error: 'email_taken' }, 409);

  const [newUser] = await sql`
    insert into users (email, password_hash, name, role, is_active, avatar_url, youtube_url, phone)
    values (${parsed.data.email}, ${hashPassword(parsed.data.password)}, ${parsed.data.name},
            ${parsed.data.role}, true, ${parsed.data.avatar_url ?? null}, ${parsed.data.youtube_url ?? null}, ${parsed.data.phone ?? null})
    returning id, email, name, role, is_active, avatar_url, youtube_url, phone, created_at`;

  if (parsed.data.role === 'pt') {
    await sql`
      insert into staff_profile (user_id, spec)
      values (${newUser.id}, ${parsed.data.spec ?? null})`;
  }

  return c.json({ pt: newUser, user: newUser }, 201);
});

// Daftar semua staff (admin & PT)
staff.get('/', requireRole('admin'), async (c) => {
  const roleQuery = c.req.query('role');
  const sql = db(c);

  const rows = await sql`
    select u.id, u.email, u.name, u.role, u.is_active, u.created_at, u.avatar_url, u.youtube_url, u.phone,
           sp.spec,
           coalesce(count(distinct cl.id), 0)::int as client_count
    from users u
    left join staff_profile sp on sp.user_id = u.id
    left join clients cl on cl.pt_id = u.id
    where u.role in ('admin', 'pt')
      ${roleQuery === 'pt' ? sql`and u.role = 'pt'` : sql``}
    group by u.id, sp.spec
    order by case when u.role = 'admin' then 1 else 2 end, u.created_at desc`;

  return c.json({ staff: rows });
});

// Edit profil staff
const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().transform((s) => s.toLowerCase().trim()).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['admin', 'pt']).optional(),
  phone: z.string().max(30).nullable().optional(),
  spec: z.string().max(100).nullable().optional(),
  avatar_url: z.string().max(2000000).nullable().optional(),
  youtube_url: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
});

staff.patch('/:id', requireRole('admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const id = c.req.param('id') as string;
  const d = parsed.data;
  const sql = db(c);

  if (d.email) {
    const [dup] = await sql`select 1 from users where email = ${d.email} and id <> ${id}`;
    if (dup) return c.json({ error: 'email_taken' }, 409);
  }

  const pwdHash = d.password ? hashPassword(d.password) : null;

  if (d.spec !== undefined) {
    await sql`
      insert into staff_profile (user_id, spec)
      values (${id}, ${d.spec})
      on conflict (user_id) do update set spec = ${d.spec}
    `;
  }

  const [row] = await sql`
    update users set
      name = coalesce(${d.name ?? null}, name),
      email = coalesce(${d.email ?? null}, email),
      password_hash = coalesce(${pwdHash ?? null}, password_hash),
      role = coalesce(${d.role ?? null}, role),
      phone = ${d.phone !== undefined ? d.phone : sql`phone`},
      is_active = coalesce(${d.is_active ?? null}, is_active),
      avatar_url = ${d.avatar_url !== undefined ? d.avatar_url : sql`avatar_url`},
      youtube_url = ${d.youtube_url !== undefined ? d.youtube_url : sql`youtube_url`}
    where id = ${id}
    returning id, email, name, role, is_active, avatar_url, youtube_url, phone, created_at`;

  if (!row) return c.json({ error: 'not_found' }, 404);

  const [sp] = await sql`select spec from staff_profile where user_id = ${id}`;
  return c.json({ pt: { ...row, spec: sp?.spec ?? null }, user: { ...row, spec: sp?.spec ?? null } });
});

// Hapus staff (admin saja, tidak bisa hapus diri sendiri)
staff.delete('/:id', requireRole('admin'), async (c) => {
  const u = c.get('user');
  const id = c.req.param('id') as string;
  if (id === u.id) return c.json({ error: 'cannot_delete_self' }, 400);

  const sql = db(c);
  const res = await sql`delete from users where id = ${id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default staff;
