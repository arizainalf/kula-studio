import { Hono } from 'hono';
import type { Env } from './env';
import authRoutes from './modules/auth/routes';
import staffRoutes from './modules/staff/routes';
import clientRoutes from './modules/clients/routes';
import sessionRoutes from './modules/sessions/routes';
import scheduleRoutes from './modules/schedule/routes';
import photoRoutes from './modules/photos/routes';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, env: c.env?.ENV ?? 'unset' }));

app.route('/api/auth', authRoutes);
app.route('/api/staff', staffRoutes);
app.route('/api/clients', clientRoutes);
app.route('/api/clients', sessionRoutes);
app.route('/api/schedule', scheduleRoutes);
app.route('/api/photos', photoRoutes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal' }, 500);
});

export default app;
