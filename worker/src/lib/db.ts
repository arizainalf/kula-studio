// postgres.js di Workers: socket TCP milik request context yang membuatnya —
// instance per-request (WeakMap key = Hono context), BUKAN module-level singleton.
// fetch_types:false + prepare:false wajib utk pooler transaction mode.
import postgres from 'postgres';

const cache = new WeakMap<object, ReturnType<typeof postgres>>();

export function db(c: { env: { DATABASE_URL: string } }) {
  let sql = cache.get(c);
  if (!sql) {
    sql = postgres(c.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      prepare: false,
      fetch_types: false,
      onnotice: () => {},
    });
    cache.set(c, sql);
  }
  return sql;
}
