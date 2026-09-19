import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const staff = new Hono<{ Bindings: Env }>();
staff.use('*', requireAuth, rejectGraceWrite);

// Manager mengundang PT, Admin dapat mengundang PT/Manager/Admin
const inviteSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'manager', 'pt']).default('pt'),
  spec: z.string().max(100).optional(),
  plan_tier: z.enum(['standard', 'pro']).default('standard'),
  expires_at: z.string().date().nullable().default(null),
});

staff.post('/invite', requireRole('manager', 'admin'), async (c) => {
  const parsed = inviteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const inviter = c.get('user');
  if (inviter.email === parsed.data.email) return c.json({ error: 'self_invite' }, 400);

  // Hanya admin yang bisa membuat role selain 'pt'
  const assignedRole = inviter.role === 'admin' ? parsed.data.role : 'pt';

  const sql = db(c);
  const exists = await sql`select 1 from users where email = ${parsed.data.email}`;
  if (exists.length) return c.json({ error: 'email_taken' }, 409);

  const [newUser] = await sql`
    insert into users (email, password_hash, name, role, is_active, plan_tier, expires_at)
    values (${parsed.data.email}, ${hashPassword(parsed.data.password)}, ${parsed.data.name},
            ${assignedRole}, true, ${parsed.data.plan_tier}, ${parsed.data.expires_at})
    returning id, email, name, role, plan_tier, expires_at, is_active, created_at`;

  if (assignedRole === 'pt') {
    await sql`
      insert into staff_profile (user_id, manager_id, spec)
      values (${newUser.id}, ${inviter.role === 'manager' ? inviter.id : null}, ${parsed.data.spec ?? null})`;
  }

  return c.json({ pt: newUser, user: newUser }, 201);
});

// Daftar staff/users (PT di bawah manager, atau semua jenis user untuk admin)
staff.get('/', requireRole('manager', 'admin'), async (c) => {
  const u = c.get('user');
  const roleQuery = c.req.query('role'); // 'pt', 'all', dsb.
  const sql = db(c);

  if (u.role === 'admin') {
    const rows = roleQuery === 'pt'
      ? await sql`
          select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at,
                 sp.manager_id, sp.spec,
                 coalesce(count(distinct cl.id), 0)::int as client_count
          from users u
          left join staff_profile sp on sp.user_id = u.id
          left join clients cl on cl.pt_id = u.id
          where u.role = 'pt'
          group by u.id, sp.manager_id, sp.spec
          order by u.created_at desc`
      : await sql`
          select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at,
                 sp.manager_id, sp.spec,
                 coalesce(count(distinct cl.id), 0)::int as client_count
          from users u
          left join staff_profile sp on sp.user_id = u.id
          left join clients cl on cl.pt_id = u.id
          group by u.id, sp.manager_id, sp.spec
          order by case when u.role = 'admin' then 1 when u.role = 'manager' then 2 else 3 end, u.created_at desc`;
    return c.json({ staff: rows });
  }

  // Role: manager
  const rows = await sql`
    select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at,
           sp.manager_id, sp.spec,
           coalesce(count(distinct cl.id), 0)::int as client_count
    from users u
    join staff_profile sp on sp.user_id = u.id
    left join clients cl on cl.pt_id = u.id
    where sp.manager_id = ${u.id}
    group by u.id, sp.manager_id, sp.spec
    order by u.created_at desc`;
  return c.json({ staff: rows });
});

// Ubah profil user/staff (Admin bisa ubah semua role, manager bisa ubah PT miliknya)
const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().transform((s) => s.toLowerCase().trim()).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['admin', 'manager', 'pt']).optional(),
  spec: z.string().max(100).nullable().optional(),
  plan_tier: z.enum(['standard', 'pro']).optional(),
  expires_at: z.string().date().nullable().optional(),
  is_active: z.boolean().optional(),
});

staff.patch('/:id', requireRole('manager', 'admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const id = c.req.param('id') as string;
  const d = parsed.data;

  const u = c.get('user');
  const sql = db(c);

  if (u.role === 'manager') {
    const owns = await sql`select 1 from staff_profile where user_id = ${id} and manager_id = ${u.id}`;
    if (!owns.length) return c.json({ error: 'forbidden' }, 403);
  }

  if (d.email) {
    const [dup] = await sql`select 1 from users where email = ${d.email} and id <> ${id}`;
    if (dup) return c.json({ error: 'email_taken' }, 409);
  }

  const pwdHash = d.password ? hashPassword(d.password) : null;
  const newRole = u.role === 'admin' ? d.role : undefined;

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
      role = coalesce(${newRole ?? null}, role),
      plan_tier = coalesce(${d.plan_tier ?? null}, plan_tier),
      expires_at = coalesce(${d.expires_at ?? null}, expires_at),
      is_active = coalesce(${d.is_active ?? null}, is_active)
    where id = ${id}
    returning id, email, name, role, plan_tier, expires_at, is_active, created_at`;

  if (!row) return c.json({ error: 'not_found' }, 404);

  const [sp] = await sql`select spec from staff_profile where user_id = ${id}`;
  return c.json({ pt: { ...row, spec: sp?.spec ?? null }, user: { ...row, spec: sp?.spec ?? null } });
});

// Hapus user/staff (Khusus admin, tidak bisa hapus akun diri sendiri)
staff.delete('/:id', requireRole('admin'), async (c) => {
  const u = c.get('user');
  const id = c.req.param('id') as string;
  if (id === u.id) return c.json({ error: 'cannot_delete_self' }, 400);

  const sql = db(c);
  const res = await sql`delete from users where id = ${id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default staff;
