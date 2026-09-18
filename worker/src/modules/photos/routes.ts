// ponytail: placeholder Fase 5 — presign upload R2 + serve foto. Tanpa ini dulu (YAGNI sampai FE jalan).
import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth';
import type { Env } from '../../env';

const photos = new Hono<{ Bindings: Env }>();
photos.use('*', requireAuth);

photos.get('/', (c) => c.json({ error: 'not_implemented' }, 501));

export default photos;
