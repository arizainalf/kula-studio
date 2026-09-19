import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const sessions = new Hono<{ Bindings: Env }>();
sessions.use('*', requireAuth, rejectGraceWrite);

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  detail: z.string().max(200).optional(),
});

const sessionSchema = z.object({
  date: z.string().date(),
  rpe: z.number().int().min(1).max(10),
  weight: z.number().min(0).max(500).nullable().optional(),
  fat_pct: z.number().min(0).max(100).nullable().optional(),
  exercises: z.array(z.record(z.string(), z.array(exerciseSchema))).default([]),
  notes: z.string().max(2000).optional(),
});

// PT harus punya client-nya (manager/admin_studio read-only list; client read own)
async function ownsClient(sql: ReturnType<typeof db>, clientId: string, u: { id: string; role: string; studio_id?: string | null }) {
  if (u.role === 'client') return u.id === clientId ? { pt_id: null } : null;
  const [row] = await sql`select pt_id, studio_id from clients where id = ${clientId}`;
  if (!row) return null;
  if (u.role === 'platform_admin') return row;
  if (u.role === 'admin_studio') {
    if (!u.studio_id || row.studio_id === u.studio_id) return row;
    return null;
  }
  if (row.pt_id === u.id) return row;
  if (u.role === 'manager') {
    const [m] = await sql`select 1 from staff_profile where user_id = ${row.pt_id} and manager_id = ${u.id}`;
    if (m) return row;
  }
  return null;
}

// GET /api/sessions — Daftar seluruh sesi (untuk PDF export & report rekap)
sessions.get('/', async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);

  const from = c.req.query('from');
  const to = c.req.query('to');
  const clientId = c.req.query('clientId');
  const minRpe = c.req.query('minRpe');
  const limit = Math.min(Number(c.req.query('limit') ?? 500), 1000);

  const sql = db(c);
  const rows = await sql`
    select 
      s.*,
      c.name as client_name,
      c.goal as client_goal,
      c.phone as client_phone,
      c.pkg_total as client_pkg_total,
      row_number() over (partition by s.client_id order by s.date asc, s.created_at asc)::int as session_number,
      count(*) over (partition by s.client_id)::int as client_pkg_used,
      p.name as pt_name
    from sessions s
    join clients c on c.id = s.client_id
    join users p on p.id = s.pt_id
    where (
      ${u.role} = 'platform_admin'
      or (${u.role} = 'admin_studio' and (${u.studio_id ? sql`c.studio_id = ${u.studio_id}` : sql`true`}))
      or s.pt_id = ${u.id}
      or (${u.role} = 'manager' and exists(
           select 1 from staff_profile sp where sp.user_id = s.pt_id and sp.manager_id = ${u.id}))
    )
      ${from ? sql`and s.date >= ${from}` : sql``}
      ${to ? sql`and s.date <= ${to}` : sql``}
      ${clientId ? sql`and s.client_id = ${clientId}` : sql``}
      ${minRpe ? sql`and s.rpe >= ${Number(minRpe)}` : sql``}
    order by s.date desc, s.created_at desc
    limit ${limit}
  `;

  return c.json({ sessions: rows });
});

// GET /api/clients/:clientId/sessions — keyset pagination ?before=<date>&limit=
sessions.get('/:clientId/sessions', async (c) => {
  const u = c.get('user');
  const clientId = c.req.param('clientId');
  const sql = db(c);
  const owned = await ownsClient(sql, clientId, u);
  if (!owned) return c.json({ error: 'forbidden' }, 403);

  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  const before = c.req.query('before');
  const rows = await sql`
    select * from sessions
    where client_id = ${clientId} ${before ? sql`and date < ${before}` : sql``}
    order by date desc limit ${limit}`;
  return c.json({ sessions: rows, next: rows.length === limit ? rows[rows.length - 1].date : null });
});

sessions.post('/:clientId/sessions', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  const clientId = c.req.param('clientId');
  const sql = db(c);
  const owned = await ownsClient(sql, clientId, u);
  if (!owned) return c.json({ error: 'forbidden' }, 403);

  const parsed = sessionSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const d = parsed.data;
  const [row] = await sql`
    insert into sessions (client_id, pt_id, date, rpe, weight, fat_pct, exercises, notes)
    values (${clientId}, ${u.id}, ${d.date}, ${d.rpe}, ${d.weight ?? null}, ${d.fat_pct ?? null},
            ${sql.json(d.exercises)}, ${d.notes ?? null})
    returning *`;
  return c.json({ session: row }, 201);
});

sessions.patch('/:clientId/sessions/:id', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  const sql = db(c);
  const owned = await ownsClient(sql, c.req.param('clientId'), u);
  if (!owned) return c.json({ error: 'forbidden' }, 403);
  const parsed = sessionSchema.partial().safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const d = parsed.data;
  const [row] = await sql`
    update sessions set
      date = coalesce(${d.date ?? null}, date),
      rpe = coalesce(${d.rpe ?? null}, rpe),
      weight = coalesce(${d.weight ?? null}, weight),
      fat_pct = coalesce(${d.fat_pct ?? null}, fat_pct),
      exercises = coalesce(${d.exercises ? sql.json(d.exercises) : null}, exercises),
      notes = coalesce(${d.notes ?? null}, notes)
    where id = ${c.req.param('id')} and pt_id = ${u.id} returning *`;
  return row ? c.json({ session: row }) : c.json({ error: 'not_found' }, 404);
});

sessions.delete('/:clientId/sessions/:id', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  const sql = db(c);
  const res = await sql`delete from sessions where id = ${c.req.param('id')} and pt_id = ${u.id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default sessions;
