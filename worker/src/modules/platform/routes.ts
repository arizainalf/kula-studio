import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, requireRole } from '../../middleware/auth';
import type { Env } from '../../env';

export const platform = new Hono<{ Bindings: Env }>();

// 1. GET /platform/settings — Publik untuk Landing Page & Identitas Aplikasi
platform.get('/settings', async (c) => {
  const sql = db(c);
  await sql`alter table platform_settings add column if not exists show_pricing boolean not null default true`.catch(() => {});
  const [row] = await sql`select * from platform_settings where id = 'default'`;
  if (!row) {
    return c.json({ error: 'settings_not_found' }, 404);
  }
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('Pragma', 'no-cache');
  return c.json({ settings: row });
});

// 2. GET /platform/trainers — Publik untuk Showcase Pelatih di Landing Page
platform.get('/trainers', async (c) => {
  const sql = db(c);
  try {
    const rows = await sql`
      select u.id, u.name, u.avatar_url, u.youtube_url, u.role, u.phone, sp.spec
      from users u
      left join staff_profile sp on sp.user_id = u.id
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
  show_pricing: z.boolean().optional(),
});

// 3. PATCH /platform/settings — Khusus Admin
platform.patch('/settings', requireAuth, requireRole('admin'), async (c) => {
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
      show_pricing = coalesce(${d.show_pricing ?? null}, show_pricing),
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

// 4. GET /platform/overview — Metrik ringkas aplikasi
platform.get('/overview', requireAuth, requireRole('admin'), async (c) => {
  const sql = db(c);

  const [usersCount] = await sql`
    select
      count(*) filter (where role = 'admin')::int as total_admins,
      count(*) filter (where role = 'pt')::int as total_pts
    from users
  `;

  const [clientsCount] = await sql`select count(*)::int as total_clients from clients`;
  const [sessionsCount] = await sql`select count(*)::int as total_sessions from sessions`;

  return c.json({
    overview: {
      total_studios: 1,
      active_studios: 1,
      suspended_studios: 0,
      total_admins: usersCount?.total_admins ?? 0,
      total_pts: usersCount?.total_pts ?? 0,
      total_clients: clientsCount?.total_clients ?? 0,
      total_sessions: sessionsCount?.total_sessions ?? 0,
    },
  });
});

// 5. GET /platform/studios — Compatibility endpoint (returns empty array)
platform.get('/studios', requireAuth, async (c) => {
  return c.json({ studios: [] });
});

export default platform;
