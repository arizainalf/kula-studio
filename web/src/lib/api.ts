// API client — cookie-based auth, proxy /api → :8787 di dev
export type User = {
  id: string;
  email: string;
  role: 'platform_admin' | 'admin_studio' | 'manager' | 'pt' | 'client';
  name: string;
  avatar_url?: string | null;
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

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type HowItWorksStep = {
  id: string;
  step: string;
  title: string;
  description: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  badge?: string | null;
  price: string;
  period?: string | null;
  description?: string | null;
  features: string[];
  button_text?: string | null;
  button_link?: string | null;
  is_popular?: boolean;
};

export type LongTermPlan = {
  id: string;
  title: string;
  price: string;
  description?: string | null;
  is_highlight?: boolean;
};

export type PlatformSettings = {
  id: string;
  app_name: string;
  app_tagline: string;
  app_initials: string;
  logo_url?: string | null;
  hero_pill: string;
  hero_headline: string;
  hero_gradient: string;
  hero_subheadline: string;
  features: FeatureItem[];
  how_it_works: HowItWorksStep[];
  pricing_plans: PricingPlan[];
  long_term_plans: LongTermPlan[];
  contact_whatsapp: string;
  contact_email: string;
  cta_headline: string;
  cta_subheadline: string;
  footer_copyright: string;
  updated_at?: string;
};

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `http_${res.status}`), { status: res.status });
  }
  return res.json();
}
