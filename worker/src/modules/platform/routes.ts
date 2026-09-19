import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole } from '../../middleware/auth';
import type { Env } from '../../env';

export const platform = new Hono<{ Bindings: Env }>();

// Semua route di platform khusus role platform_admin
platform.use('*', requireAuth, requireRole('platform_admin'));

// 1. GET /platform/overview — Metrik keseluruhan SaaS Platform
platform.get('/overview', async (c) => {
  const sql = db(c);

  const [studiosCount] = await sql`
    select
      count(*)::int as total_studios,
      count(*) filter (where is_active = true)::int as active_studios,
      count(*) filter (where is_active = false)::int as suspended_studios
    from studios
  `;

  const [usersCount] = await sql`
    select
      count(*) filter (where role = 'admin_studio')::int as total_admins,
      count(*) filter (where role = 'pt')::int as total_pts,
      count(*) filter (where role = 'manager')::int as total_managers
    from users
    where role <> 'platform_admin'
  `;

  const [clientsCount] = await sql`select count(*)::int as total_clients from clients`;
  const [sessionsCount] = await sql`select count(*)::int as total_sessions from sessions`;

  return c.json({
    overview: {
      ...studiosCount,
      ...usersCount,
      total_clients: clientsCount?.total_clients ?? 0,
      total_sessions: sessionsCount?.total_sessions ?? 0,
    },
  });
});

// 2. GET /platform/studios — Daftar semua studio beserta statistik & info admin studio
platform.get('/studios', async (c) => {
  const sql = db(c);

  const rows = await sql`
    select
      s.id,
      s.name,
      s.slug,
      s.address,
      s.phone,
      s.plan_tier,
      s.is_active,
      s.subscription_expires_at,
      s.created_at,
      coalesce(count(distinct case when u.role = 'pt' then u.id end), 0)::int as pt_count,
      coalesce(count(distinct cl.id), 0)::int as client_count,
      coalesce(count(distinct sess.id), 0)::int as session_count,
      max(case when u.role = 'admin_studio' then u.name end) as admin_name,
      max(case when u.role = 'admin_studio' then u.email end) as admin_email
    from studios s
    left join users u on u.studio_id = s.id
    left join clients cl on cl.studio_id = s.id
    left join sessions sess on sess.pt_id = u.id
    group by s.id
    order by s.created_at desc
  `;

  return c.json({ studios: rows });
});

// 3. POST /platform/studios — Mendaftarkan studio baru beserta akun Admin Studio awal
const createStudioSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)'),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  plan_tier: z.enum(['starter', 'standard', 'pro', 'enterprise']).default('standard'),
  subscription_expires_at: z.string().date().optional().nullable(),
  admin_name: z.string().min(2).max(100),
  admin_email: z.string().email().transform((s) => s.toLowerCase().trim()),
  admin_password: z.string().min(6).max(100),
});

platform.post('/studios', async (c) => {
  const parsed = createStudioSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  }

  const sql = db(c);
  const d = parsed.data;

  // Cek apakah slug sudah ada
  const [existingSlug] = await sql`select 1 from studios where slug = ${d.slug}`;
  if (existingSlug) return c.json({ error: 'slug_taken', message: 'Slug studio ini sudah digunakan.' }, 409);

  // Cek apakah email admin sudah ada
  const [existingEmail] = await sql`select 1 from users where email = ${d.admin_email}`;
  if (existingEmail) return c.json({ error: 'email_taken', message: 'Email admin ini sudah terdaftar.' }, 409);

  // Buat studio baru
  const [newStudio] = await sql`
    insert into studios (name, slug, address, phone, plan_tier, subscription_expires_at, is_active)
    values (${d.name}, ${d.slug}, ${d.address ?? null}, ${d.phone ?? null}, ${d.plan_tier}, ${d.subscription_expires_at ?? null}, true)
    returning *
  `;

  // Buat akun Admin untuk studio tersebut
  const [newAdmin] = await sql`
    insert into users (email, password_hash, name, role, is_active, plan_tier, studio_id)
    values (${d.admin_email}, ${hashPassword(d.admin_password)}, ${d.admin_name}, 'admin_studio', true, null, ${newStudio.id})
    returning id, email, name, role, studio_id, created_at
  `;

  return c.json(
    {
      studio: newStudio,
      admin: newAdmin,
      message: `Studio "${newStudio.name}" dan akun Admin berhasil dibuat.`,
    },
    201
  );
});

// 4. PATCH /platform/studios/:id — Edit data studio, tier, tanggal expired, atau suspend/aktifkan
const updateStudioSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  plan_tier: z.enum(['starter', 'standard', 'pro', 'enterprise']).optional(),
  is_active: z.boolean().optional(),
  subscription_expires_at: z.string().date().optional().nullable(),
});

platform.patch('/studios/:id', async (c) => {
  const studioId = c.req.param('id');
  const parsed = updateStudioSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  }

  const sql = db(c);
  const d = parsed.data;

  if (d.slug) {
    const [existing] = await sql`select id from studios where slug = ${d.slug} and id <> ${studioId}`;
    if (existing) return c.json({ error: 'slug_taken', message: 'Slug studio ini sudah digunakan.' }, 409);
  }

  const [updated] = await sql`
    update studios set
      name = coalesce(${d.name ?? null}, name),
      slug = coalesce(${d.slug ?? null}, slug),
      address = ${d.address !== undefined ? d.address : sql`address`},
      phone = ${d.phone !== undefined ? d.phone : sql`phone`},
      plan_tier = coalesce(${d.plan_tier ?? null}, plan_tier),
      is_active = coalesce(${d.is_active ?? null}, is_active),
      subscription_expires_at = ${d.subscription_expires_at !== undefined ? d.subscription_expires_at : sql`subscription_expires_at`}
    where id = ${studioId}
    returning *
  `;

  if (!updated) return c.json({ error: 'studio_not_found' }, 404);
  return c.json({ studio: updated });
});

// 5. GET /platform/studios/:id — Detail studio + staf di dalamnya
platform.get('/studios/:id', async (c) => {
  const studioId = c.req.param('id');
  const sql = db(c);

  const [studio] = await sql`select * from studios where id = ${studioId}`;
  if (!studio) return c.json({ error: 'studio_not_found' }, 404);

  const staff = await sql`
    select u.id, u.email, u.name, u.role, u.is_active, u.plan_tier, u.created_at, sp.spec
    from users u
    left join staff_profile sp on sp.user_id = u.id
    where u.studio_id = ${studioId}
    order by case when u.role = 'admin_studio' then 1 when u.role = 'manager' then 2 else 3 end, u.name asc
  `;

  const [counts] = await sql`
    select
      coalesce(count(distinct cl.id), 0)::int as client_count,
      coalesce(count(distinct s.id), 0)::int as session_count
    from clients cl
    left join sessions s on s.client_id = cl.id
    where cl.studio_id = ${studioId}
  `;

  return c.json({
    studio,
    staff,
    stats: counts,
  });
});

// 6. DELETE /platform/studios/:id — Hapus studio
platform.delete('/studios/:id', async (c) => {
  const studioId = c.req.param('id');
  const sql = db(c);

  const [deleted] = await sql`delete from studios where id = ${studioId} returning id, name`;
  if (!deleted) return c.json({ error: 'studio_not_found' }, 404);

  return c.json({ ok: true, message: `Studio "${deleted.name}" berhasil dihapus.` });
});
