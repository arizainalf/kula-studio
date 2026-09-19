import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../../lib/db';
import { verifyPassword, signToken, hashPassword } from '../../lib/auth';
import { requireAuth } from '../../middleware/auth';
import type { Env } from '../../env';

const auth = new Hono<{ Bindings: Env }>();

const loginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(6).max(100),
});

auth.post('/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const [user] = await db(c)`
    select id, email, password_hash, name, role, is_active, plan_tier, expires_at
    from users where email = ${parsed.data.email}`;

  // Pesan generik — jangan bocorkan email terdaftar
  if (!user || !verifyPassword(parsed.data.password, user.password_hash))
    return c.json({ error: 'invalid_credentials' }, 401);
  if (!user.is_active) return c.json({ error: 'pending_activation' }, 403);

  const payload = {
    sub: {
      id: user.id, email: user.email, role: user.role, name: user.name,
      plan_tier: user.plan_tier, expires_at: user.expires_at,
    },
    exp: Date.now() + 7 * 86400_000,
  };
  const token = signToken(payload, c.env.SESSION_SECRET);
  c.header(
    'Set-Cookie',
    `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`,
  );
  return c.json({ user: payload.sub });
});

const clientLoginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  phone: z.string().min(4).max(30).transform((s) => s.trim()),
});

function normalizePhone(p?: string | null): string {
  if (!p) return '';
  let clean = p.replace(/\D/g, '');
  if (clean.startsWith('62')) clean = '0' + clean.slice(2);
  return clean;
}

auth.post('/client-login', async (c) => {
  const parsed = clientLoginSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const inputNorm = normalizePhone(parsed.data.phone);

  const sql = db(c);
  const rows = await sql`
    select c.*, p.name as pt_name, p.email as pt_email
    from clients c
    join users p on p.id = c.pt_id
    where lower(c.email) = ${parsed.data.email} and c.is_active = true
  `;

  const client = rows.find((cl) => {
    if (!cl.phone) return false;
    const dbNorm = normalizePhone(cl.phone);
    return dbNorm === inputNorm || cl.phone.trim() === parsed.data.phone;
  });

  if (!client) {
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  const payload = {
    sub: {
      id: client.id,
      clientId: client.id,
      email: client.email,
      phone: client.phone,
      name: client.name,
      role: 'client' as const,
      pt_id: client.pt_id,
      pt_name: client.pt_name,
    },
    exp: Date.now() + 30 * 86400_000,
  };

  const token = signToken(payload, c.env.SESSION_SECRET);
  c.header(
    'Set-Cookie',
    `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${30 * 86400}`,
  );
  return c.json({ user: payload.sub });
});

auth.post('/logout', (c) => {
  c.header('Set-Cookie', 'tl_session=; HttpOnly; Secure; Path=/; Max-Age=0');
  return c.json({ ok: true });
});

auth.get('/me', requireAuth, (c) => c.json({ user: c.get('user') }));

// GET /api/auth/profile — Mengambil profil lengkap pengguna (Semua role: Admin, Manager, PT, Client)
auth.get('/profile', requireAuth, async (c) => {
  const u = c.get('user');
  const sql = db(c);

  if (u.role === 'client') {
    const clientId = u.clientId || u.id;
    const [client] = await sql`
      select c.*, p.name as pt_name, p.email as pt_email
      from clients c
      join users p on p.id = c.pt_id
      where c.id = ${clientId}
    `;
    if (!client) return c.json({ error: 'client_not_found' }, 404);
    return c.json({
      user: {
        id: client.id,
        clientId: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: 'client' as const,
        gender: client.gender,
        age_bracket: client.age_bracket,
        problem: client.problem,
        notes: client.notes,
        pt_id: client.pt_id,
        pt_name: client.pt_name,
        pkg_total: client.pkg_total,
      },
    });
  }

  const [row] = await sql`
    select u.id, u.email, u.name, u.role, u.plan_tier, u.expires_at, u.is_active, u.created_at, sp.spec
    from users u
    left join staff_profile sp on sp.user_id = u.id
    where u.id = ${u.id}
  `;
  if (!row) return c.json({ error: 'user_not_found' }, 404);
  return c.json({ user: row });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  spec: z.string().max(100).optional().nullable(),
  gender: z.enum(['pria', 'wanita']).optional().nullable(),
  age_bracket: z.string().max(20).optional().nullable(),
  problem: z.enum(['none', 'knee', 'back', 'shoulder']).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

// PATCH /api/auth/profile — Mengedit profil akun sendiri (Semua role: Admin, Manager, PT, Client)
auth.patch('/profile', requireAuth, async (c) => {
  const u = c.get('user');
  const parsed = updateProfileSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_input', detail: parsed.error.flatten() }, 400);

  const d = parsed.data;
  const sql = db(c);

  if (u.role === 'client') {
    const clientId = u.clientId || u.id;
    const cleanEmail = d.email !== undefined ? (d.email && d.email.trim() ? d.email.toLowerCase().trim() : null) : undefined;
    const cleanPhone = d.phone !== undefined ? (d.phone && d.phone.trim() ? d.phone.trim() : null) : undefined;

    const [updatedClient] = await sql`
      update clients set
        name = coalesce(${d.name ?? null}, name),
        email = ${cleanEmail !== undefined ? cleanEmail : sql`email`},
        phone = ${cleanPhone !== undefined ? cleanPhone : sql`phone`},
        gender = coalesce(${d.gender ?? null}, gender),
        age_bracket = coalesce(${d.age_bracket ?? null}, age_bracket),
        problem = coalesce(${d.problem ?? null}, problem),
        notes = coalesce(${d.notes ?? null}, notes)
      where id = ${clientId}
      returning *
    `;

    if (!updatedClient) return c.json({ error: 'client_not_found' }, 404);

    const payload = {
      sub: {
        id: updatedClient.id,
        clientId: updatedClient.id,
        email: updatedClient.email,
        phone: updatedClient.phone,
        name: updatedClient.name,
        role: 'client' as const,
        pt_id: updatedClient.pt_id,
        pt_name: u.pt_name,
      },
      exp: Date.now() + 30 * 86400_000,
    };
    const token = signToken(payload, c.env.SESSION_SECRET);
    c.header(
      'Set-Cookie',
      `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${30 * 86400}`,
    );

    return c.json({
      user: {
        ...payload.sub,
        gender: updatedClient.gender,
        age_bracket: updatedClient.age_bracket,
        problem: updatedClient.problem,
        notes: updatedClient.notes,
        pkg_total: updatedClient.pkg_total,
      },
      message: 'Profil klien berhasil diperbarui',
    });
  }

  // Admin, Manager, PT
  const cleanEmail = d.email ? d.email.toLowerCase().trim() : undefined;
  if (cleanEmail && cleanEmail !== u.email.toLowerCase()) {
    const [exists] = await sql`select 1 from users where email = ${cleanEmail} and id <> ${u.id}`;
    if (exists) return c.json({ error: 'email_taken' }, 409);
  }

  const newHash = d.password ? hashPassword(d.password) : null;

  const [updatedUser] = await sql`
    update users set
      name = coalesce(${d.name ?? null}, name),
      email = coalesce(${cleanEmail ?? null}, email),
      password_hash = coalesce(${newHash ?? null}, password_hash)
    where id = ${u.id}
    returning id, email, name, role, plan_tier, expires_at, is_active
  `;

  if (!updatedUser) return c.json({ error: 'user_not_found' }, 404);

  if (d.spec !== undefined) {
    await sql`
      insert into staff_profile (user_id, spec)
      values (${u.id}, ${d.spec})
      on conflict (user_id) do update set spec = ${d.spec}
    `;
  }

  const [sp] = await sql`select spec from staff_profile where user_id = ${u.id}`;

  const payload = {
    sub: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as any,
      name: updatedUser.name,
      plan_tier: updatedUser.plan_tier,
      expires_at: updatedUser.expires_at,
    },
    exp: Date.now() + 7 * 86400_000,
  };
  const token = signToken(payload, c.env.SESSION_SECRET);
  c.header(
    'Set-Cookie',
    `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`,
  );

  return c.json({
    user: {
      ...payload.sub,
      spec: sp?.spec ?? null,
    },
    message: 'Profil akun berhasil diperbarui',
  });
});

// POST /api/auth/toggle-admin — Memungkinkan akun PT menjadi akun Admin (dan sebaliknya)
auth.post('/toggle-admin', requireAuth, async (c) => {
  const u = c.get('user');
  if (u.role === 'client') return c.json({ error: 'forbidden' }, 403);

  const sql = db(c);
  const targetRole = u.role === 'admin' ? 'pt' : 'admin';

  const [updated] = await sql`
    update users set role = ${targetRole}
    where id = ${u.id}
    returning id, email, name, role, plan_tier, expires_at
  `;

  if (!updated) return c.json({ error: 'user_not_found' }, 404);

  const payload = {
    sub: {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      name: updated.name,
      plan_tier: updated.plan_tier,
      expires_at: updated.expires_at,
    },
    exp: Date.now() + 7 * 86400_000,
  };
  const token = signToken(payload, c.env.SESSION_SECRET);
  c.header(
    'Set-Cookie',
    `tl_session=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`,
  );

  return c.json({ user: payload.sub, message: `Role berhasil diubah menjadi ${targetRole}` });
});

export default auth;
