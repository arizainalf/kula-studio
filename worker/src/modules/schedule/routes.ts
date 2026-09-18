import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const schedule = new Hono<{ Bindings: Env }>();
schedule.use('*', requireAuth, rejectGraceWrite);

const schedSchema = z.object({
  client_id: z.string().uuid(),
  date: z.string().date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().max(200).optional(),
});

// GET /api/schedule?from=&to= — jadwal milik PT (manager: staff+sendiri via join)
schedule.get('/', async (c) => {
  const u = c.get('user');
  const from = c.req.query('from');
  const to = c.req.query('to');
  if (!from || !to) return c.json({ error: 'from_to_required' }, 400);
  const sql = db(c);
  const rows = await sql`
    select s.*, c.name as client_name, c.phone as client_phone
    from schedule s join clients c on c.id = s.client_id
    where s.date between ${from} and ${to}
      and (${u.role} = 'admin' or s.pt_id = ${u.id}
           or (${u.role} = 'manager' and exists(
                select 1 from staff_profile sp where sp.user_id = s.pt_id and sp.manager_id = ${u.id})))
    order by s.date, s.time`;
  return c.json({ schedule: rows });
});

schedule.post('/', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  const parsed = schedSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  const sql = db(c);
  const [client] = await sql`select 1 from clients where id = ${parsed.data.client_id} and pt_id = ${u.id}`;
  if (!client) return c.json({ error: 'forbidden' }, 403);
  const [row] = await sql`
    insert into schedule (client_id, pt_id, date, time, note)
    values (${parsed.data.client_id}, ${u.id}, ${parsed.data.date}, ${parsed.data.time}, ${parsed.data.note ?? null})
    returning *`;
  return c.json({ schedule: row }, 201);
});

schedule.delete('/:id', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  const res = await db(c)`delete from schedule where id = ${c.req.param('id')} and pt_id = ${u.id}`;
  return res.count ? c.json({ ok: true }) : c.json({ error: 'not_found' }, 404);
});

export default schedule;
