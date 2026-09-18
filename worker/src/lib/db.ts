// postgres.js di Workers: socket TCP milik request context yang membuatnya —
// instance per-request (WeakMap key = Hono context), BUKAN module-level singleton.
// fetch_types:false + prepare:false wajib utk pooler transaction mode.
import postgres from 'postgres';

const cache = new WeakMap<object, ReturnType<typeof postgres>>();

type DbContext = { env: { DATABASE_URL: string } } | { DATABASE_URL: string };

export function db(c: DbContext) {
  let sql = cache.get(c);
  if (!sql) {
    const url =
      'env' in c && c.env && typeof c.env.DATABASE_URL === 'string'
        ? c.env.DATABASE_URL
        : 'DATABASE_URL' in c && typeof c.DATABASE_URL === 'string'
          ? c.DATABASE_URL
          : undefined;

    if (!url) {
      throw new Error(
        'DATABASE_URL is not defined in environment bindings. Pastikan .dev.vars terisi atau secret telah diset di Cloudflare Workers.'
      );
    }

    sql = postgres(url, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      prepare: false,
      fetch_types: false,
      types: {
        date: {
          to: 1082,
          from: [1082],
          serialize: (x: string | Date) => (x instanceof Date ? x.toISOString().slice(0, 10) : x),
          parse: (x: string) => x,
        },
      },
      onnotice: () => {},
    });
    cache.set(c, sql);
  }
  return sql;
}
