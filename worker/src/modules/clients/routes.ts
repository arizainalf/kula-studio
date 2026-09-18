import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const clients = new Hono<{ Bindings: Env }>();
clients.use('*', requireAuth, rejectGraceWrite);

const clientSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.enum(['fat_loss', 'muscle_gain', 'general']).default('general'),
  pkg_total: z.number().int().min(0).max(1000).default(0),
  phone: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  age_bracket: z.string().max(20).optional(),
  gender: z.enum(['pria', 'wanita']).optional(),
  pregnant: z.boolean().default(false),
  problem: z.enum(['none', 'knee', 'back', 'shoulder']).default('none'),
  is_active: z.boolean().optional(),
});

// Manager/admin: semua; PT: miliknya. scope = cek ownership di service layer ini.
clients.get('/', async (c) => {
  const u = c.get('user');
  const sql = db(c);
  const rows = u.role === 'pt'
    ? await sql`select * from clients where pt_id = ${u.id} order by created_at desc`
    : u.role === 'manager'
      ? await sql`select c.* from clients c
                  join users p on p.id = c.pt_id
                  left join staff_profile sp on sp.user_id = p.id
                  where c.pt_id = ${u.id} or sp.manager_id = ${u.id}
                  order by c.created_at desc`
      : await sql`select * from clients order by created_at desc`;
  return c.json({ clients: rows });
});

clients.post('/', async (c) => {
  const u = c.get('user');
  if (u.role === 'admin') return c.json({ error: 'forbidden' }, 403); // admin tidak punya client
  const parsed = clientSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const [row] = await db(c)`
    insert into clients (pt_id, name, goal, pkg_total, phone, notes, age_bracket, gender, pregnant, problem)
    values (${u.id}, ${parsed.data.name}, ${parsed.data.goal}, ${parsed.data.pkg_total},
            ${parsed.data.phone ?? null}, ${parsed.data.notes ?? null}, ${parsed.data.age_bracket ?? null},
            ${parsed.data.gender ?? null}, ${parsed.data.pregnant}, ${parsed.data.problem})
    returning *`;
  return c.json({ client: row }, 201);
});

// Helper ownership: PT pemilik / manager atasannya / admin — dipakai get/patch/delete
async function canAccessClient(sql: ReturnType<typeof db>, clientId: string, u: { id: string; role: string }) {
  const [row] = await sql`
    select 1 from clients c
    where c.id = ${clientId}
      and (${u.role} = 'admin' or c.pt_id = ${u.id}
           or (${u.role} = 'manager' and exists(
                select 1 from staff_profile sp where sp.user_id = c.pt_id and sp.manager_id = ${u.id})))`;
  return !!row;
}

clients.get('/:id', async (c) => {
  const id = c.req.param('id');
  const sql = db(c);
  if (!(await canAccessClient(sql, id, c.get('user')))) return c.json({ error: 'forbidden' }, 403);
  const [row] = await sql`select * from clients where id = ${id}`;
  return row ? c.json({ client: row }) : c.json({ error: 'not_found' }, 404);
});

clients.patch('/:id', async (c) => {
  const u = c.get('user');
  const id = c.req.param('id');
  const sql = db(c);
  if (!(await canAccessClient(sql, id, u))) return c.json({ error: 'forbidden' }, 403);
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403); // edit = pemilik saja
  const parsed = clientSchema.partial().safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const d = parsed.data;
  const [row] = await sql`
    update clients set
      name = coalesce(${d.name ?? null}, name),
      goal = coalesce(${d.goal ?? null}, goal),
      pkg_total = coalesce(${d.pkg_total ?? null}, pkg_total),
      phone = coalesce(${d.phone ?? null}, phone),
      notes = coalesce(${d.notes ?? null}, notes),
      age_bracket = coalesce(${d.age_bracket ?? null}, age_bracket),
      gender = coalesce(${d.gender ?? null}, gender),
      pregnant = coalesce(${d.pregnant ?? null}, pregnant),
      problem = coalesce(${d.problem ?? null}, problem),
      is_active = coalesce(${d.is_active ?? null}, is_active)
    where id = ${id} returning *`;
  return row ? c.json({ client: row }) : c.json({ error: 'not_found' }, 404);
});

clients.delete('/:id', requireRole('pt'), async (c) => {
  const u = c.get('user');
  const id = c.req.param('id') as string;
  const sql = db(c);
  const res = await sql`delete from clients where id = ${id} and pt_id = ${u.id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default clients;
