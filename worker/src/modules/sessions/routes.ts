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
  exercises: z.array(z.object({
    warmup: z.array(exerciseSchema).default([]),
    resistance: z.array(exerciseSchema).default([]),
    cardio: z.array(exerciseSchema).default([]),
    cooldown: z.array(exerciseSchema).default([]),
  })).default([]),
  notes: z.string().max(2000).optional(),
});

// PT harus punya client-nya (manager/admin read-only list)
async function ownsClient(sql: ReturnType<typeof db>, clientId: string, u: { id: string; role: string }) {
  const [row] = await sql`select pt_id from clients where id = ${clientId}`;
  if (!row) return null;
  if (u.role === 'admin') return row;
  if (row.pt_id === u.id) return row;
  if (u.role === 'manager') {
    const [m] = await sql`select 1 from staff_profile where user_id = ${row.pt_id} and manager_id = ${u.id}`;
    if (m) return row;
  }
  return null;
}

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
