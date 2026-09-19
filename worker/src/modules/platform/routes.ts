import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import { requireAuth, requireRole } from '../../middleware/auth';
import type { Env } from '../../env';

export const platform = new Hono<{ Bindings: Env }>();

// 0. GET /platform/settings — Publik untuk Landing Page & Identitas Aplikasi
platform.get('/settings', async (c) => {
  const sql = db(c);
  // Auto-migrate legacy 'TrainLog' default data to 'Kula Studio'
  try {
    await sql`
      update platform_settings set
        app_name = case when app_name ilike '%trainlog%' then 'Kula Studio' else app_name end,
        app_initials = case when app_initials = 'TL' then 'KS' else app_initials end,
        contact_email = case when contact_email ilike '%trainlog%' then 'support@kula-studio.my.id' else contact_email end,
        footer_copyright = case when footer_copyright ilike '%trainlog%' then 'Kula Studio. Hak Cipta Dilindungi.' else footer_copyright end
      where id = 'default' and (app_name ilike '%trainlog%' or contact_email ilike '%trainlog%' or app_initials = 'TL' or footer_copyright ilike '%trainlog%')
    `;
  } catch (migErr) {
    console.error('Error auto-migrating platform settings:', migErr);
  }

  const [row] = await sql`select * from platform_settings where id = 'default'`;
  if (!row) {
    return c.json({ error: 'settings_not_found' }, 404);
  }
  return c.json({ settings: row });
});

// 0.1 GET /platform/trainers — Publik untuk Showcase Pelatih & Video YouTube di Landing Page
platform.get('/trainers', async (c) => {
  const sql = db(c);
  try {
    await sql`alter table users add column if not exists phone text`.catch(() => {});
    await sql`alter table studios add column if not exists gmaps_url text`.catch(() => {});

    await sql`
      update users
      set youtube_url = 'https://www.youtube.com/watch?v=aclHkVaku9U',
          phone = coalesce(phone, '6287884241516'),
          studio_id = coalesce(studio_id, '00000000-0000-0000-0000-000000000001')
      where role = 'pt' and (email = 'hadi@dev.local' or name ilike '%hadi%')
    `.catch(() => {});

    await sql`
      update studios
      set gmaps_url = 'https://maps.google.com/?q=FitZone+Studio+Jakarta'
      where gmaps_url is null or trim(gmaps_url) = ''
    `.catch(() => {});

    const rows = await sql`
      select u.id, u.name, u.avatar_url, u.youtube_url, u.role, u.phone,
             sp.spec, s.name as studio_name, s.slug as studio_slug, s.address as studio_address, s.gmaps_url as studio_gmaps_url
      from users u
      left join staff_profile sp on sp.user_id = u.id
      left join studios s on s.id = u.studio_id
      where u.role = 'pt' and u.is_active = true
      order by case when u.youtube_url is not null and trim(u.youtube_url) != '' then 0 else 1 end, u.created_at desc
      limit 12
    `;
    return c.json({ trainers: rows });
  } catch (err: any) {
    console.error('Error fetching trainers:', err);
    return c.json({ trainers: [] });
  }
});

// Route platform_admin
platform.use('/overview', requireAuth, requireRole('platform_admin'));
platform.use('/studios', requireAuth, requireRole('platform_admin'));
platform.use('/studios/*', requireAuth, requireRole('platform_admin'));

// Schema validasi update settings
const updateSettingsSchema = z.object({
  app_name: z.string().min(1).max(100).optional(),
  app_tagline: z.string().max(150).optional(),
  app_initials: z.string().max(10).optional(),
  logo_url: z.string().max(2000000).nullable().optional(),
  hero_pill: z.string().max(200).optional(),
  hero_headline: z.string().max(300).optional(),
  hero_gradient: z.string().max(300).optional(),
  hero_subheadline: z.string().max(1000).optional(),
  features: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })).optional(),
  how_it_works: z.array(z.object({
    id: z.string(),
    step: z.string(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  pricing_plans: z.array(z.object({
    id: z.string(),
    name: z.string(),
    badge: z.string().optional().nullable(),
    price: z.string(),
    period: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    features: z.array(z.string()),
    button_text: z.string().optional().nullable(),
    button_link: z.string().optional().nullable(),
    is_popular: z.boolean().optional(),
  })).optional(),
  long_term_plans: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.string(),
    description: z.string().optional().nullable(),
    is_highlight: z.boolean().optional(),
  })).optional(),
  contact_whatsapp: z.string().max(50).optional(),
  contact_email: z.string().max(100).optional(),
  cta_headline: z.string().max(300).optional(),
  cta_subheadline: z.string().max(1000).optional(),
  footer_copyright: z.string().max(300).optional(),
});

// PATCH /platform/settings — Khusus platform_admin
platform.patch('/settings', requireAuth, requireRole('platform_admin'), async (c) => {
  const parsed = updateSettingsSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);
  }

  const sql = db(c);
  const d = parsed.data;

  const [updated] = await sql`
    update platform_settings set
      app_name = coalesce(${d.app_name ?? null}, app_name),
      app_tagline = coalesce(${d.app_tagline ?? null}, app_tagline),
      app_initials = coalesce(${d.app_initials ?? null}, app_initials),
      logo_url = ${d.logo_url !== undefined ? d.logo_url : sql`logo_url`},
      hero_pill = coalesce(${d.hero_pill ?? null}, hero_pill),
      hero_headline = coalesce(${d.hero_headline ?? null}, hero_headline),
      hero_gradient = coalesce(${d.hero_gradient ?? null}, hero_gradient),
      hero_subheadline = coalesce(${d.hero_subheadline ?? null}, hero_subheadline),
      features = ${d.features !== undefined ? sql`${JSON.stringify(d.features)}::jsonb` : sql`features`},
      how_it_works = ${d.how_it_works !== undefined ? sql`${JSON.stringify(d.how_it_works)}::jsonb` : sql`how_it_works`},
      pricing_plans = ${d.pricing_plans !== undefined ? sql`${JSON.stringify(d.pricing_plans)}::jsonb` : sql`pricing_plans`},
      long_term_plans = ${d.long_term_plans !== undefined ? sql`${JSON.stringify(d.long_term_plans)}::jsonb` : sql`long_term_plans`},
      contact_whatsapp = coalesce(${d.contact_whatsapp ?? null}, contact_whatsapp),
      contact_email = coalesce(${d.contact_email ?? null}, contact_email),
      cta_headline = coalesce(${d.cta_headline ?? null}, cta_headline),
      cta_subheadline = coalesce(${d.cta_subheadline ?? null}, cta_subheadline),
      footer_copyright = coalesce(${d.footer_copyright ?? null}, footer_copyright),
      updated_at = now()
    where id = 'default'
    returning *
  `;

  if (!updated) {
    return c.json({ error: 'settings_not_found' }, 404);
  }

  return c.json({
    settings: updated,
    message: 'Pengaturan identitas platform berhasil disimpan.',
  });
});


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
      s.gmaps_url,
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
  gmaps_url: z.string().max(500).optional().nullable(),
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
    insert into studios (name, slug, address, phone, gmaps_url, plan_tier, subscription_expires_at, is_active)
    values (${d.name}, ${d.slug}, ${d.address ?? null}, ${d.phone ?? null}, ${d.gmaps_url ?? null}, ${d.plan_tier}, ${d.subscription_expires_at ?? null}, true)
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
  gmaps_url: z.string().max(500).optional().nullable(),
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
      gmaps_url = ${d.gmaps_url !== undefined ? d.gmaps_url : sql`gmaps_url`},
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
