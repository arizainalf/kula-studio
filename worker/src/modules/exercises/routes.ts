import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAuth, optionalAuth, requireRole, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const exercises = new Hono<{ Bindings: Env }>();

// ── SCHEMAS ──
const categorySchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug kategori hanya boleh huruf kecil dan strip (-)'),
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional().nullable(),
  icon: z.string().min(1).max(50).default('dumbbell'),
  sort_order: z.number().int().default(0),
});

const newExerciseSchema = z.object({
  category_slug: z.string().min(2).max(50),
  name: z.string().min(1).max(100),
  default_detail: z.string().max(200).optional().nullable(),
  muscle_group: z.string().max(100).optional().nullable(),
  is_favorite: z.boolean().default(false),
  is_global: z.boolean().default(false),
});

// ── 1. CATEGORIES ENDPOINTS ──

// GET /api/exercises/categories — Daftar kategori gerakan
exercises.get('/categories', async (c) => {
  const sql = db(c);
  const rows = await sql`
    select 
      c.*,
      count(l.id)::int as exercise_count
    from exercise_categories c
    left join exercise_library l on l.category_slug = c.slug
    group by c.slug, c.name, c.description, c.icon, c.sort_order, c.created_at
    order by c.sort_order asc
  `;
  return c.json({ categories: rows });
});

// POST /api/exercises/categories — Tambah kategori baru (Khusus Admin)
exercises.post('/categories', requireAuth, requireRole('admin'), rejectGraceWrite, async (c) => {
  const parsed = categorySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);

  const sql = db(c);
  const d = parsed.data;

  const [existing] = await sql`select 1 from exercise_categories where slug = ${d.slug}`;
  if (existing) return c.json({ error: 'slug_already_exists' }, 409);

  const [row] = await sql`
    insert into exercise_categories (slug, name, description, icon, sort_order)
    values (${d.slug.toLowerCase().trim()}, ${d.name.trim()}, ${d.description?.trim() ?? null}, ${d.icon.trim()}, ${d.sort_order})
    returning *
  `;

  return c.json({ category: row }, 201);
});

// PATCH /api/exercises/categories/:slug — Edit kategori (Khusus Admin)
exercises.patch('/categories/:slug', requireAuth, requireRole('admin'), rejectGraceWrite, async (c) => {
  const slug = c.req.param('slug') as string;
  const patchCatSchema = categorySchema.partial().omit({ slug: true });
  const parsed = patchCatSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const sql = db(c);
  const d = parsed.data;

  const [row] = await sql`
    update exercise_categories set
      name = coalesce(${d.name ?? null}, name),
      description = coalesce(${d.description ?? null}, description),
      icon = coalesce(${d.icon ?? null}, icon),
      sort_order = coalesce(${d.sort_order ?? null}, sort_order)
    where slug = ${slug}
    returning *
  `;

  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ category: row });
});

// DELETE /api/exercises/categories/:slug — Hapus kategori (Khusus Admin)
exercises.delete('/categories/:slug', requireAuth, requireRole('admin'), rejectGraceWrite, async (c) => {
  const slug = c.req.param('slug') as string;
  const sql = db(c);

  const res = await sql`delete from exercise_categories where slug = ${slug}`;
  if (res.count === 0) return c.json({ error: 'not_found' }, 404);

  return c.json({ ok: true });
});

// ── 2. EXERCISES LIBRARY ENDPOINTS ──

// GET /api/exercises — Daftar gerakan di library
exercises.get('/', optionalAuth, async (c) => {
  const sql = db(c);
  const category = c.req.query('category');
  const q = c.req.query('q');

  let userId: string | null = null;
  let isAdmin = false;
  try {
    const u = c.get('user');
    if (u) {
      userId = u.id;
      isAdmin = u.role === 'admin';
    }
  } catch {
    // optional
  }

  const rows = await sql`
    select 
      l.*,
      c.name as category_name,
      c.icon as category_icon,
      (case when l.pt_id is null then true else false end) as is_global,
      u.name as pt_name
    from exercise_library l
    join exercise_categories c on c.slug = l.category_slug
    left join users u on u.id = l.pt_id
    where (
      l.pt_id is null
      or l.pt_id = ${userId}
      or ${isAdmin ? sql`true` : sql`false`}
    )
      ${category ? sql`and l.category_slug = ${category}` : sql``}
      ${q ? sql`and (l.name ilike ${'%' + q + '%'} or l.muscle_group ilike ${'%' + q + '%'} or l.default_detail ilike ${'%' + q + '%'})` : sql``}
    order by l.category_slug asc, l.is_favorite desc, l.name asc
  `;

  return c.json({ exercises: rows });
});

// POST /api/exercises — Tambah gerakan ke library
exercises.post('/', requireAuth, rejectGraceWrite, async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);

  const parsed = newExerciseSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);

  const sql = db(c);
  const d = parsed.data;

  // Cek apakah category_slug valid
  const [cat] = await sql`select 1 from exercise_categories where slug = ${d.category_slug}`;
  if (!cat) return c.json({ error: 'invalid_category' }, 400);

  // Jika admin mencentang is_global, set pt_id = null
  const ptId = (u.role === 'admin' && d.is_global) ? null : u.id;

  const [row] = await sql`
    insert into exercise_library (pt_id, category_slug, name, default_detail, muscle_group, is_favorite)
    values (${ptId}, ${d.category_slug}, ${d.name.trim()}, ${d.default_detail?.trim() ?? null}, ${d.muscle_group?.trim() ?? null}, ${d.is_favorite})
    returning *
  `;

  return c.json({ exercise: row }, 201);
});

// PATCH /api/exercises/:id — Edit gerakan di library (Admin bisa edit semua, PT edit miliknya)
exercises.patch('/:id', requireAuth, rejectGraceWrite, async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);

  const id = c.req.param('id') as string;
  const patchExSchema = newExerciseSchema.partial();
  const parsed = patchExSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const sql = db(c);
  const d = parsed.data;

  const [existing] = await sql`select pt_id from exercise_library where id = ${id}`;
  if (!existing) return c.json({ error: 'not_found' }, 404);

  const canEdit = u.role === 'admin' || existing.pt_id === u.id;
  if (!canEdit) {
    return c.json({ error: 'forbidden' }, 403);
  }

  const [row] = await sql`
    update exercise_library set
      name = coalesce(${d.name ? d.name.trim() : null}, name),
      default_detail = ${d.default_detail !== undefined ? (d.default_detail ? d.default_detail.trim() : null) : sql`default_detail`},
      muscle_group = ${d.muscle_group !== undefined ? (d.muscle_group ? d.muscle_group.trim() : null) : sql`muscle_group`},
      category_slug = coalesce(${d.category_slug ?? null}, category_slug),
      is_favorite = coalesce(${d.is_favorite ?? null}, is_favorite)
    where id = ${id}
    returning *
  `;

  return c.json({ exercise: row });
});

// DELETE /api/exercises/:id — Hapus gerakan di library (Admin bisa hapus semua, PT hapus miliknya)
exercises.delete('/:id', requireAuth, rejectGraceWrite, async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);

  const id = c.req.param('id') as string;
  const sql = db(c);

  const res = u.role === 'admin'
    ? await sql`delete from exercise_library where id = ${id}`
    : await sql`delete from exercise_library where id = ${id} and pt_id = ${u.id}`;

  if (res.count === 0) {
    return c.json({ error: 'not_found_or_not_owner' }, 404);
  }

  return c.json({ ok: true });
});

export default exercises;
