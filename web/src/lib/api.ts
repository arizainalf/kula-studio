// API client — cookie-based auth, proxy /api → :8787 di dev
export type User = {
  id: string;
  email: string;
  role: 'platform_admin' | 'admin_studio' | 'manager' | 'pt' | 'client';
  name: string;
  plan_tier?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  studio_id?: string | null;
  studio_name?: string | null;
  studio_slug?: string | null;
  studio_plan_tier?: string | null;
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

export type Studio = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  plan_tier: 'starter' | 'standard' | 'pro' | 'enterprise';
  is_active: boolean;
  subscription_expires_at?: string | null;
  created_at: string;
  pt_count?: number;
  client_count?: number;
  session_count?: number;
  admin_name?: string | null;
  admin_email?: string | null;
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
