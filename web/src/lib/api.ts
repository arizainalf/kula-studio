// API client — cookie-based auth, proxy /api → :8787 di dev
export type User = {
  id: string;
  email: string;
  role: 'platform_admin' | 'admin_studio' | 'manager' | 'pt' | 'client';
  name: string;
  avatar_url?: string | null;
  youtube_url?: string | null;
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

export type TrainerShowcase = {
  id: string;
  name: string;
  avatar_url?: string | null;
  youtube_url?: string | null;
  role: string;
  spec?: string | null;
  studio_name?: string | null;
  studio_slug?: string | null;
};

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const TOKEN_KEY = 'tl_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (path === '/auth/logout') {
    setStoredToken(null);
  }

  if (!res.ok) {
    if (res.status === 401 && path === '/auth/me') {
      setStoredToken(null);
    }
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `http_${res.status}`), { status: res.status });
  }
  return res.json();
}
