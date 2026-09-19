// API client — cookie-based auth, proxy /api → :8787 di dev
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'pt' | 'client';
  name: string;
  plan_tier?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  clientId?: string;
  phone?: string | null;
  pt_id?: string;
  pt_name?: string | null;
  spec?: string | null;
  gender?: 'pria' | 'wanita' | null;
  age_bracket?: string | null;
  problem?: string | null;
  notes?: string | null;
  pkg_total?: number;
  client_count?: number;
  created_at?: string;
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
