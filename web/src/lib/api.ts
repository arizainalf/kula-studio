// API client — cookie-based auth, proxy /api → :8787 di dev
export type User = {
  id: string; email: string; role: string; name: string;
  plan_tier: string; expires_at: string | null;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `http_${res.status}`), { status: res.status });
  }
  return res.json();
}
