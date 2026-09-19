import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const staff = new Hono<{ Bindings: Env }>();
staff.use('*', requireAuth, rejectGraceWrite);

// Manager mengundang PT, Admin dapat mengundang PT/Manager/Admin di studionya, Platform Admin dapat mengundang ke studio mana saja
const inviteSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(['admin_studio', 'manager', 'pt']).default('pt'),
  spec: z.string().max(100).optional(),
  avatar_url: z.string().max(2000000).optional().nullable(),
  youtube_url: z.string().max(500).optional().nullable(),
  plan_tier: z.enum(['standard', 'pro']).default('standard'),
  expires_at: z.string().date().nullable().default(null),
  studio_id: z.string().uuid().optional().nullable(),
});

staff.post('/invite', requireRole('manager', 'admin_studio', 'platform_admin'), async (c) => {
  const parsed = inviteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const inviter = c.get('user');
  if (inviter.email === parsed.data.email) return c.json({ error: 'self_invite' }, 400);

  // Validasi hierarki pembuatan akun ketat: hanya bisa menambah role di bawahnya
  let assignedRole: 'admin_studio' | 'manager' | 'pt';
  if (inviter.role === 'platform_admin') {
    assignedRole = parsed.data.role;
  } else if (inviter.role === 'admin_studio') {
    if (parsed.data.role !== 'manager' && parsed.data.role !== 'pt') {
      return c.json({ error: 'forbidden_role', message: 'Admin Studio hanya dapat mendaftarkan akun di bawahnya (Manager atau PT)' }, 403);
    }
    assignedRole = parsed.data.role;
  } else if (inviter.role === 'manager') {
    if (parsed.data.role !== 'pt') {
      return c.json({ error: 'forbidden_role', message: 'Manager hanya dapat mendaftarkan akun di bawahnya (PT)' }, 403);
    }
    assignedRole = 'pt';
  } else {
    return c.json({ error: 'forbidden' }, 403);
  }

  // Validasi studio assignment: Platform admin wajib memilih studio
  let assignedStudioId = inviter.studio_id;
  if (inviter.role === 'platform_admin') {
    if (!parsed.data.studio_id) {
      return c.json({ error: 'studio_required', message: 'Platform Admin wajib memilih Studio Gym tujuan penugasan akun' }, 400);
    }
    assignedStudioId = parsed.data.studio_id;
  }

  const sql = db(c);
  const exists = await sql`select 1 from users where email = ${parsed.data.email}`;
  if (exists.length) return c.json({ error: 'email_taken' }, 409);

  const [newUser] = await sql`
    insert into users (email, password_hash, name, role, is_active, plan_tier, expires_at, studio_id, avatar_url, youtube_url)
    values (${parsed.data.email}, ${hashPassword(parsed.data.password)}, ${parsed.data.name},
            ${assignedRole}, true, ${parsed.data.plan_tier}, ${parsed.data.expires_at}, ${assignedStudioId ?? null}, ${parsed.data.avatar_url ?? null}, ${parsed.data.youtube_url ?? null})
    returning id, email, name, role, plan_tier, expires_at, is_active, studio_id, avatar_url, youtube_url, created_at`;

  if (assignedRole === 'pt') {
    await sql`
      insert into staff_profile (user_id, manager_id, spec)
      values (${newUser.id}, ${inviter.role === 'manager' ? inviter.id : null}, ${parsed.data.spec ?? null})`;
  }

  return c.json({ pt: newUser, user: newUser }, 201);
});

// Daftar staff/users (PT di bawah manager, semua user di studio untuk admin_studio, atau semua studio untuk platform_admin)
staff.get('/', requireRole('manager', 'admin_studio', 'platform_admin'), async (c) => {
  const u = c.get('user');
  const roleQuery = c.req.query('role'); // 'pt', 'all', dsb.
  const studioFilter = c.req.query('studioId');
  const sql = db(c);

  if (u.role === 'platform_admin') {
    const rows = await sql`
      select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at, u.avatar_url, u.youtube_url,
             u.studio_id, s.name as studio_name,
             sp.manager_id, sp.spec,
             coalesce(count(distinct cl.id), 0)::int as client_count
      from users u
      left join studios s on s.id = u.studio_id
      left join staff_profile sp on sp.user_id = u.id
      left join clients cl on cl.pt_id = u.id
      where u.role <> 'platform_admin'
        ${roleQuery === 'pt' ? sql`and u.role = 'pt'` : sql``}
        ${studioFilter ? sql`and u.studio_id = ${studioFilter}` : sql``}
      group by u.id, s.name, sp.manager_id, sp.spec
      order by case when u.role = 'admin_studio' then 1 when u.role = 'manager' then 2 else 3 end, u.created_at desc`;
    return c.json({ staff: rows });
  }

  if (u.role === 'admin_studio') {
    const rows = roleQuery === 'pt'
      ? await sql`
          select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at, u.avatar_url, u.youtube_url,
                 u.studio_id,
                 sp.manager_id, sp.spec,
                 coalesce(count(distinct cl.id), 0)::int as client_count
          from users u
          left join staff_profile sp on sp.user_id = u.id
          left join clients cl on cl.pt_id = u.id
          where u.role = 'pt' and u.studio_id = ${u.studio_id ?? null}
          group by u.id, sp.manager_id, sp.spec
          order by u.created_at desc`
      : await sql`
          select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at, u.avatar_url, u.youtube_url,
                 u.studio_id,
                 sp.manager_id, sp.spec,
                 coalesce(count(distinct cl.id), 0)::int as client_count
          from users u
          left join staff_profile sp on sp.user_id = u.id
          left join clients cl on cl.pt_id = u.id
          where u.studio_id = ${u.studio_id ?? null} and u.role <> 'platform_admin'
          group by u.id, sp.manager_id, sp.spec
          order by case when u.role = 'admin_studio' then 1 when u.role = 'manager' then 2 else 3 end, u.created_at desc`;
    return c.json({ staff: rows });
  }

  // Role: manager
  const rows = await sql`
    select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at, u.avatar_url, u.youtube_url,
           u.studio_id,
           sp.manager_id, sp.spec,
           coalesce(count(distinct cl.id), 0)::int as client_count
    from users u
    join staff_profile sp on sp.user_id = u.id
    left join clients cl on cl.pt_id = u.id
    where sp.manager_id = ${u.id} and u.studio_id = ${u.studio_id ?? null}
    group by u.id, sp.manager_id, sp.spec
    order by u.created_at desc`;
  return c.json({ staff: rows });
});

// Ubah profil user/staff (Admin bisa ubah semua role, manager bisa ubah PT miliknya)
const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().transform((s) => s.toLowerCase().trim()).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['admin_studio', 'manager', 'pt']).optional(),
  spec: z.string().max(100).nullable().optional(),
  avatar_url: z.string().max(2000000).nullable().optional(),
  youtube_url: z.string().max(500).nullable().optional(),
  plan_tier: z.enum(['standard', 'pro']).optional(),
  expires_at: z.string().date().nullable().optional(),
  is_active: z.boolean().optional(),
});

staff.patch('/:id', requireRole('manager', 'admin_studio', 'platform_admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const id = c.req.param('id') as string;
  const d = parsed.data;

  const u = c.get('user');
  const sql = db(c);

  if (u.role === 'manager') {
    const owns = await sql`select 1 from staff_profile where user_id = ${id} and manager_id = ${u.id}`;
    if (!owns.length) return c.json({ error: 'forbidden' }, 403);
  } else if (u.role === 'admin_studio') {
    const [target] = await sql`select role, studio_id from users where id = ${id}`;
    if (!target || target.studio_id !== u.studio_id) return c.json({ error: 'forbidden' }, 403);
    if (target.role === 'admin_studio' && id !== u.id) {
      return c.json({ error: 'forbidden', message: 'Tidak dapat mengubah akun Admin Studio lain.' }, 403);
    }
  }

  if (d.email) {
    const [dup] = await sql`select 1 from users where email = ${d.email} and id <> ${id}`;
    if (dup) return c.json({ error: 'email_taken' }, 409);
  }

  const pwdHash = d.password ? hashPassword(d.password) : null;
  let newRole: string | undefined = undefined;
  if (u.role === 'platform_admin') {
    newRole = d.role;
  } else if (u.role === 'admin_studio') {
    if (d.role) {
      if (d.role !== 'manager' && d.role !== 'pt') {
        return c.json({ error: 'forbidden', message: 'Admin Studio hanya dapat mengatur role Manager atau PT.' }, 403);
      }
      newRole = d.role;
    }
  }

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
      is_active = coalesce(${d.is_active ?? null}, is_active),
      avatar_url = ${d.avatar_url !== undefined ? d.avatar_url : sql`avatar_url`},
      youtube_url = ${d.youtube_url !== undefined ? d.youtube_url : sql`youtube_url`}
    where id = ${id}
    returning id, email, name, role, plan_tier, expires_at, is_active, studio_id, avatar_url, youtube_url, created_at`;

  if (!row) return c.json({ error: 'not_found' }, 404);

  const [sp] = await sql`select spec from staff_profile where user_id = ${id}`;
  return c.json({ pt: { ...row, spec: sp?.spec ?? null }, user: { ...row, spec: sp?.spec ?? null } });
});

// Hapus user/staff (Khusus admin studio atau platform admin, tidak bisa hapus akun diri sendiri)
staff.delete('/:id', requireRole('admin_studio', 'platform_admin'), async (c) => {
  const u = c.get('user');
  const id = c.req.param('id') as string;
  if (id === u.id) return c.json({ error: 'cannot_delete_self' }, 400);

  const sql = db(c);
  if (u.role === 'admin_studio') {
    const [target] = await sql`select role, studio_id from users where id = ${id}`;
    if (!target || target.studio_id !== u.studio_id) return c.json({ error: 'forbidden' }, 403);
    if (target.role === 'admin_studio') return c.json({ error: 'forbidden', message: 'Tidak dapat menghapus akun Admin Studio.' }, 403);
  }
  const res = await sql`delete from users where id = ${id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default staff;
