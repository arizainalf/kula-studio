import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const clients = new Hono<{ Bindings: Env }>();
clients.use('*', requireAuth, rejectGraceWrite);

const createClientSchema = z.object({
  pt_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100),
  goal: z.enum(['fat_loss', 'muscle_gain', 'general']).default('general'),
  pkg_total: z.number().int().min(0).max(1000).default(0),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  age_bracket: z.string().max(20).optional().nullable(),
  gender: z.enum(['pria', 'wanita']).optional().nullable(),
  pregnant: z.boolean().default(false),
  problem: z.enum(['none', 'knee', 'back', 'shoulder']).default('none'),
  is_active: z.boolean().optional(),
});

const updateClientSchema = z.object({
  pt_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100).optional(),
  goal: z.enum(['fat_loss', 'muscle_gain', 'general']).optional(),
  pkg_total: z.number().int().min(0).max(1000).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  age_bracket: z.string().max(20).optional().nullable(),
  gender: z.enum(['pria', 'wanita']).optional().nullable(),
  pregnant: z.boolean().optional(),
  problem: z.enum(['none', 'knee', 'back', 'shoulder']).optional(),
  is_active: z.boolean().optional(),
});

// Manager/admin: per-studio; Platform admin: semua studio; PT: miliknya.
clients.get('/', async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);
  const sql = db(c);
  const studioFilter = c.req.query('studioId');

  const rows = u.role === 'pt'
    ? await sql`
        select c.*,
               p.name as pt_name,
               p.email as pt_email,
               coalesce(count(s.id), 0)::int as pkg_used,
               coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
               max(s.date) as last_session_date
        from clients c
        join users p on p.id = c.pt_id
        left join sessions s on s.client_id = c.id
        where c.pt_id = ${u.id}
        group by c.id, p.name, p.email
        order by c.created_at desc`
    : u.role === 'manager'
      ? await sql`
        select c.*,
               p.name as pt_name,
               p.email as pt_email,
               coalesce(count(s.id), 0)::int as pkg_used,
               coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
               max(s.date) as last_session_date
        from clients c
        join users p on p.id = c.pt_id
        left join staff_profile sp on sp.user_id = p.id
        left join sessions s on s.client_id = c.id
        where c.studio_id = ${u.studio_id ?? null} and (c.pt_id = ${u.id} or sp.manager_id = ${u.id})
        group by c.id, p.name, p.email
        order by c.created_at desc`
    : u.role === 'admin_studio'
      ? await sql`
        select c.*,
               p.name as pt_name,
               p.email as pt_email,
               coalesce(count(s.id), 0)::int as pkg_used,
               coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
               max(s.date) as last_session_date
        from clients c
        join users p on p.id = c.pt_id
        left join sessions s on s.client_id = c.id
        where c.studio_id = ${u.studio_id ?? null}
        group by c.id, p.name, p.email
        order by c.created_at desc`
      : await sql`
        select c.*,
               p.name as pt_name,
               p.email as pt_email,
               st.name as studio_name,
               coalesce(count(s.id), 0)::int as pkg_used,
               coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
               max(s.date) as last_session_date
        from clients c
        join users p on p.id = c.pt_id
        left join studios st on st.id = c.studio_id
        left join sessions s on s.client_id = c.id
        ${studioFilter ? sql`where c.studio_id = ${studioFilter}` : sql``}
        group by c.id, p.name, p.email, st.name
        order by c.created_at desc`;

  return c.json({ clients: rows });
});

clients.post('/', async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);
  const parsed = createClientSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);

  const sql = db(c);
  let assignedPtId = u.id;

  // Admin Studio, Manager, dan Platform Admin dapat memilih PT penanggung jawab
  if (u.role === 'admin_studio' || u.role === 'manager' || u.role === 'platform_admin') {
    if (parsed.data.pt_id) {
      const [ptUser] = await sql`
        select id from users where id = ${parsed.data.pt_id} and is_active = true
      `;
      if (!ptUser) return c.json({ error: 'invalid_pt_id' }, 400);
      assignedPtId = ptUser.id;
    } else if (u.role === 'admin_studio' || u.role === 'platform_admin') {
      // Default ke PT aktif pertama di studio yang sesuai
      const [firstPt] = u.role === 'admin_studio'
        ? await sql`
            select id from users where role = 'pt' and is_active = true and studio_id = ${u.studio_id ?? null} order by created_at asc limit 1
          `
        : await sql`
            select id from users where role = 'pt' and is_active = true order by created_at asc limit 1
          `;
      if (firstPt) assignedPtId = firstPt.id;
    }
  }

  // Dapatkan studio_id dari PT atau inviter
  const [assignedPtUser] = await sql`select studio_id from users where id = ${assignedPtId}`;
  const targetStudioId = u.role === 'platform_admin'
    ? (assignedPtUser?.studio_id ?? u.studio_id ?? null)
    : (u.studio_id ?? null);

  const cleanEmail = parsed.data.email && parsed.data.email.trim() ? parsed.data.email.toLowerCase().trim() : null;
  const [row] = await sql`
    insert into clients (pt_id, studio_id, name, goal, pkg_total, email, phone, notes, age_bracket, gender, pregnant, problem)
    values (${assignedPtId}, ${targetStudioId}, ${parsed.data.name}, ${parsed.data.goal}, ${parsed.data.pkg_total},
            ${cleanEmail}, ${parsed.data.phone ?? null}, ${parsed.data.notes ?? null}, ${parsed.data.age_bracket ?? null},
            ${parsed.data.gender ?? null}, ${parsed.data.pregnant}, ${parsed.data.problem})
    returning *`;
  return c.json({ client: row }, 201);
});

// Helper ownership: Platform admin / Admin studio / Manager studio / PT pemilik
async function canAccessClient(sql: ReturnType<typeof db>, clientId: string, u: { id: string; role: string; studio_id?: string | null }) {
  if (u.role === 'platform_admin') return true;
  if (u.role === 'admin_studio') {
    const [c] = await sql`select 1 from clients where id = ${clientId} and studio_id = ${u.studio_id ?? null}`;
    return !!c;
  }
  if (u.role === 'manager') {
    const [c] = await sql`
      select 1 from clients cl
      left join staff_profile sp on sp.user_id = cl.pt_id
      where cl.id = ${clientId} and cl.studio_id = ${u.studio_id ?? null} and (cl.pt_id = ${u.id} or sp.manager_id = ${u.id})`;
    return !!c;
  }
  const [c] = await sql`select 1 from clients where id = ${clientId} and pt_id = ${u.id}`;
  return !!c;
}

clients.get('/:id', async (c) => {
  const id = c.req.param('id') as string;
  const sql = db(c);
  if (!(await canAccessClient(sql, id, c.get('user')))) return c.json({ error: 'forbidden' }, 403);
  const [row] = await sql`
    select c.*,
           p.name as pt_name,
           p.email as pt_email,
           coalesce(count(s.id), 0)::int as pkg_used,
           coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
           max(s.date) as last_session_date
        from clients c
        join users p on p.id = c.pt_id
        left join sessions s on s.client_id = c.id
        where c.id = ${id}
        group by c.id, p.name, p.email`;
  return row ? c.json({ client: row }) : c.json({ error: 'not_found' }, 404);
});

clients.patch('/:id', async (c) => {
  const u = c.get('user');
  const id = c.req.param('id') as string;
  const sql = db(c);
  if (!(await canAccessClient(sql, id, u))) return c.json({ error: 'forbidden' }, 403);
  if (u.role !== 'pt' && u.role !== 'admin_studio' && u.role !== 'manager' && u.role !== 'platform_admin') return c.json({ error: 'forbidden' }, 403);
  const parsed = updateClientSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const d = parsed.data;

  let assignedPtId: string | undefined = undefined;
  if (d.pt_id && (u.role === 'admin_studio' || u.role === 'manager' || u.role === 'platform_admin')) {
    const [ptUser] = await sql`select id from users where id = ${d.pt_id} and is_active = true`;
    if (ptUser) assignedPtId = ptUser.id;
  }

  const cleanEmail = d.email !== undefined ? (d.email && d.email.trim() ? d.email.toLowerCase().trim() : null) : undefined;
  const [row] = await sql`
    update clients set
      pt_id = coalesce(${assignedPtId ?? null}, pt_id),
      name = coalesce(${d.name ?? null}, name),
      goal = coalesce(${d.goal ?? null}, goal),
      pkg_total = coalesce(${d.pkg_total ?? null}, pkg_total),
      email = ${cleanEmail !== undefined ? cleanEmail : sql`email`},
      phone = coalesce(${d.phone ?? null}, phone),
      notes = coalesce(${d.notes ?? null}, notes),
      age_bracket = coalesce(${d.age_bracket ?? null}, age_bracket),
      gender = coalesce(${d.gender ?? null}, gender),
      pregnant = coalesce(${d.pregnant ?? null}, pregnant),
      problem = coalesce(${d.problem ?? null}, problem),
      is_active = coalesce(${d.is_active ?? null}, is_active)
    where id = ${id} returning *`;
  if (!row) return c.json({ error: 'not_found' }, 404);
  const [ptUser] = await sql`select name, email from users where id = ${row.pt_id}`;
  return c.json({ client: { ...row, pt_name: ptUser?.name ?? null, pt_email: ptUser?.email ?? null } });
});

clients.delete('/:id', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt' && u.role !== 'admin_studio' && u.role !== 'manager' && u.role !== 'platform_admin') return c.json({ error: 'forbidden' }, 403);
  const id = c.req.param('id') as string;
  const sql = db(c);
  const res = (u.role === 'admin_studio' || u.role === 'manager' || u.role === 'platform_admin')
    ? await sql`delete from clients where id = ${id}`
    : await sql`delete from clients where id = ${id} and pt_id = ${u.id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default clients;
