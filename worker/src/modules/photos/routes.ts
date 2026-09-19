// Foto sesi: upload multipart → R2 (local sim di wrangler dev), metadata di tabel photos.
// Validasi: image/jpeg|png|webp, max 5MB. Akses: ownership client + cookie (bukan public URL).
import { Hono } from 'hono';
import { db } from '../../lib/db';
import { requireAuth, rejectGraceWrite } from '../../middleware/auth';
import type { Env } from '../../env';

const photos = new Hono<{ Bindings: Env }>();
photos.use('*', requireAuth, rejectGraceWrite);

const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

async function ownsClient(sql: ReturnType<typeof db>, clientId: string, u: { id: string; role: string; studio_id?: string | null }) {
  const [row] = await sql`
    select 1 from clients c
    where c.id = ${clientId}
      and (
        ${u.role} = 'platform_admin'
        or (${u.role} = 'admin_studio' and (${u.studio_id ? sql`c.studio_id = ${u.studio_id}` : sql`true`}))
        or c.pt_id = ${u.id}
        or (${u.role} = 'manager' and exists(
             select 1 from staff_profile sp where sp.user_id = c.pt_id and sp.manager_id = ${u.id}))
      )`;
  return !!row;
}

photos.post('/:clientId', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  if (!c.env.PHOTOS_BUCKET) return c.json({ error: 'storage_not_configured' }, 501);
  const clientId = c.req.param('clientId');
  const sql = db(c);
  if (!(await ownsClient(sql, clientId, u))) return c.json({ error: 'forbidden' }, 403);

  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return c.json({ error: 'file_required' }, 400);
  if (!OK_TYPES.has(file.type)) return c.json({ error: 'invalid_type' }, 400);
  if (file.size > MAX_BYTES) return c.json({ error: 'too_large' }, 413);

  const sessionId = (form?.get('session_id') as string) || null;
  const r2Key = `${u.id}/${clientId}/${crypto.randomUUID()}.${EXT[file.type]}`;
  await c.env.PHOTOS_BUCKET.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  const [row] = await sql`
    insert into photos (client_id, pt_id, session_id, r2_key)
    values (${clientId}, ${u.id}, ${sessionId}, ${r2Key}) returning *`;
  return c.json({ photo: row }, 201);
});

photos.get('/:clientId', async (c) => {
  const u = c.get('user');
  const clientId = c.req.param('clientId');
  const sql = db(c);
  if (!(await ownsClient(sql, clientId, u))) return c.json({ error: 'forbidden' }, 403);
  const rows = await sql`
    select * from photos where client_id = ${clientId} order by created_at desc`;
  return c.json({ photos: rows });
});

// Serve bytes — tetap butuh cookie; cek via <img src> otomatis kirim same-origin cookie
photos.get('/raw/:id', async (c) => {
  const u = c.get('user');
  if (!c.env.PHOTOS_BUCKET) return c.json({ error: 'storage_not_configured' }, 501);
  const sql = db(c);
  const [row] = await sql`
    select p.r2_key, c.pt_id, c.studio_id from photos p join clients c on c.id = p.client_id where p.id = ${c.req.param('id')}`;
  if (!row) return c.json({ error: 'not_found' }, 404);
  const isPlatform = u.role === 'platform_admin';
  const isStudioAdmin = u.role === 'admin_studio' && (!u.studio_id || row.studio_id === u.studio_id);
  const isOwnerPt = row.pt_id === u.id;
  const isManager = u.role === 'manager';
  if (!isPlatform && !isStudioAdmin && !isOwnerPt && !isManager) 
    return c.json({ error: 'forbidden' }, 403);
  const obj = await c.env.PHOTOS_BUCKET.get(row.r2_key);
  if (!obj) return c.json({ error: 'not_found' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'private, max-age=86400',
    },
  });
});

photos.delete('/:id', async (c) => {
  const u = c.get('user');
  if (u.role !== 'pt') return c.json({ error: 'forbidden' }, 403);
  if (!c.env.PHOTOS_BUCKET) return c.json({ error: 'storage_not_configured' }, 501);
  const sql = db(c);
  const [row] = await sql`
    delete from photos where id = ${c.req.param('id')} and pt_id = ${u.id} returning r2_key`;
  if (!row) return c.json({ error: 'not_found' }, 404);
  await c.env.PHOTOS_BUCKET.delete(row.r2_key);
  return c.json({ ok: true });
});

export default photos;
