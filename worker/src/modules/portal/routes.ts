import { Hono } from 'hono';
import { db } from '../../lib/db';
import { requireAuth } from '../../middleware/auth';
import type { Env } from '../../env';

const portal = new Hono<{ Bindings: Env }>();
portal.use('*', requireAuth);

function getTier(points: number): { name: string; color: string; badge: string } {
  if (points >= 1000) return { name: 'Titan', color: '#a855f7', badge: '🏆 Titan' };
  if (points >= 600) return { name: 'Diamond', color: '#06b6d4', badge: '💎 Diamond' };
  if (points >= 300) return { name: 'Gold', color: '#eab308', badge: '🥇 Gold' };
  if (points >= 150) return { name: 'Silver', color: '#94a3b8', badge: '🥈 Silver' };
  return { name: 'Bronze', color: '#d97706', badge: '🥉 Bronze' };
}

// GET /api/portal/leaderboard — Ranking seluruh klien
portal.get('/leaderboard', async (c) => {
  const u = c.get('user');
  const sql = db(c);

  const rows = await sql`
    select 
      c.id,
      c.name,
      c.goal,
      count(s.id)::int as total_sessions,
      coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
      count(case when s.date >= date_trunc('month', current_date) then 1 end)::int as this_month_sessions,
      max(s.date) as last_session_date,
      coalesce(
        sum(100 + coalesce(s.rpe, 7) * 10) +
        count(case when s.date >= date_trunc('month', current_date) then 1 end) * 50,
        0
      )::int as points
    from clients c
    left join sessions s on s.client_id = c.id
    where c.is_active = true
    group by c.id
    order by points desc, total_sessions desc, c.created_at asc
  `;

  const myClientId = u.role === 'client' ? u.id : c.req.query('clientId');

  const leaderboard = rows.map((r, idx) => {
    const isMe = r.id === myClientId;
    const tier = getTier(r.points);
    return {
      rank: idx + 1,
      id: r.id,
      name: r.name,
      is_me: isMe,
      goal: r.goal,
      total_sessions: r.total_sessions,
      this_month_sessions: r.this_month_sessions,
      avg_rpe: Number(r.avg_rpe),
      points: r.points,
      tier: tier.name,
      tier_badge: tier.badge,
      tier_color: tier.color,
      last_session_date: r.last_session_date,
    };
  });

  return c.json({ leaderboard });
});

// GET /api/portal/dashboard — Dashboard lengkap client (progress, sessions, jadwal, ranking)
portal.get('/dashboard', async (c) => {
  const u = c.get('user');
  const sql = db(c);

  const clientId = u.role === 'client' ? u.id : c.req.query('clientId');
  if (!clientId) {
    return c.json({ error: 'client_id_required' }, 400);
  }

  // Cek akses: client hanya miliknya, pt/manager/admin bisa cek client-nya
  if (u.role === 'client' && u.id !== clientId) {
    return c.json({ error: 'forbidden' }, 403);
  }

  // 1. Data profil klien & PT
  const [clientRow] = await sql`
    select c.*, p.name as pt_name, p.email as pt_email
    from clients c
    join users p on p.id = c.pt_id
    where c.id = ${clientId}
  `;

  if (!clientRow) {
    return c.json({ error: 'not_found' }, 404);
  }

  // 2. Sesi latihan (terbaru ke lama)
  const sessions = await sql`
    select * from sessions
    where client_id = ${clientId}
    order by date desc, created_at desc
    limit 20
  `;

  // 3. Hitung metrik progress & transformasi
  const allSessionsAsc = await sql`
    select date, weight, fat_pct, rpe
    from sessions
    where client_id = ${clientId}
    order by date asc, created_at asc
  `;

  const totalSessions = allSessionsAsc.length;
  const sessionsWithWeight = allSessionsAsc.filter((s) => s.weight !== null);
  const startWeight = sessionsWithWeight.length > 0 ? Number(sessionsWithWeight[0].weight) : null;
  const currentWeight = sessionsWithWeight.length > 0 ? Number(sessionsWithWeight[sessionsWithWeight.length - 1].weight) : null;
  const weightChange = startWeight !== null && currentWeight !== null ? Number((currentWeight - startWeight).toFixed(1)) : null;

  const sessionsWithFat = allSessionsAsc.filter((s) => s.fat_pct !== null);
  const startFatPct = sessionsWithFat.length > 0 ? Number(sessionsWithFat[0].fat_pct) : null;
  const currentFatPct = sessionsWithFat.length > 0 ? Number(sessionsWithFat[sessionsWithFat.length - 1].fat_pct) : null;
  const fatPctChange = startFatPct !== null && currentFatPct !== null ? Number((currentFatPct - startFatPct).toFixed(1)) : null;

  const avgRpe = totalSessions > 0
    ? Number((allSessionsAsc.reduce((acc, s) => acc + (s.rpe || 0), 0) / totalSessions).toFixed(1))
    : 0;

  // Sesi bulan ini
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthSessions = allSessionsAsc.filter((s) => String(s.date).startsWith(currentMonthStr)).length;

  // 4. Jadwal mendatang
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingSchedule = await sql`
    select id, date, time, note
    from schedule
    where client_id = ${clientId} and date >= ${todayStr}
    order by date asc, time asc
    limit 5
  `;

  // 5. Ranking seluruh klien & ranking pribadi
  const rankedRows = await sql`
    select 
      c.id,
      c.name,
      c.goal,
      count(s.id)::int as total_sessions,
      coalesce(round(avg(s.rpe), 1), 0)::numeric as avg_rpe,
      count(case when s.date >= date_trunc('month', current_date) then 1 end)::int as this_month_sessions,
      coalesce(
        sum(100 + coalesce(s.rpe, 7) * 10) +
        count(case when s.date >= date_trunc('month', current_date) then 1 end) * 50,
        0
      )::int as points
    from clients c
    left join sessions s on s.client_id = c.id
    where c.is_active = true
    group by c.id
    order by points desc, total_sessions desc, c.created_at asc
  `;

  const totalClients = rankedRows.length;
  let myRankIndex = rankedRows.findIndex((r) => r.id === clientId);
  if (myRankIndex === -1) myRankIndex = totalClients; // fallback
  const myRank = myRankIndex + 1;

  const myPoints = myRankIndex < totalClients ? rankedRows[myRankIndex].points : 0;
  const myTier = getTier(myPoints);

  const prevPerson = myRankIndex > 0 ? rankedRows[myRankIndex - 1] : null;
  const pointsToNext = prevPerson ? Math.max(10, prevPerson.points - myPoints + 10) : 0;

  const percentile = totalClients > 0
    ? Math.max(1, Math.round((myRank / totalClients) * 100))
    : 100;

  const leaderboard = rankedRows.map((r, idx) => {
    const isMe = r.id === clientId;
    const tier = getTier(r.points);
    return {
      rank: idx + 1,
      id: r.id,
      name: r.name,
      is_me: isMe,
      goal: r.goal,
      total_sessions: r.total_sessions,
      this_month_sessions: r.this_month_sessions,
      avg_rpe: Number(r.avg_rpe),
      points: r.points,
      tier: tier.name,
      tier_badge: tier.badge,
      tier_color: tier.color,
    };
  });

  return c.json({
    client: {
      id: clientRow.id,
      name: clientRow.name,
      goal: clientRow.goal,
      pkg_total: clientRow.pkg_total,
      pkg_used: totalSessions,
      pkg_remaining: Math.max(0, clientRow.pkg_total - totalSessions),
      email: clientRow.email,
      phone: clientRow.phone,
      notes: clientRow.notes,
      age_bracket: clientRow.age_bracket,
      gender: clientRow.gender,
      problem: clientRow.problem,
      pt_name: clientRow.pt_name,
      pt_email: clientRow.pt_email,
    },
    stats: {
      total_sessions: totalSessions,
      this_month_sessions: thisMonthSessions,
      avg_rpe: avgRpe,
      current_weight: currentWeight,
      start_weight: startWeight,
      weight_change: weightChange,
      current_fat_pct: currentFatPct,
      start_fat_pct: startFatPct,
      fat_pct_change: fatPctChange,
    },
    recent_sessions: sessions,
    upcoming_schedule: upcomingSchedule,
    my_ranking: {
      rank: myRank,
      total_clients: totalClients,
      points: myPoints,
      tier: myTier.name,
      tier_badge: myTier.badge,
      tier_color: myTier.color,
      percentile: `Top ${percentile}%`,
      points_to_next: pointsToNext,
      is_top_3: myRank <= 3,
    },
    leaderboard,
  });
});

export default portal;
