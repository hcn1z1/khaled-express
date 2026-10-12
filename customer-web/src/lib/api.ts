import { Office, User, Parcel, NewParcelPayload } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('khaled_express_token');
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('khaled_express_token', token);
  } else {
    localStorage.removeItem('khaled_express_token');
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('khaled_express_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('khaled_express_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('khaled_express_user');
  }
}

export async function fetchApi<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.error ||
      data.detail ||
      (typeof data === 'object' ? Object.values(data)[0] : 'Une erreur est survenue');
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data as T;
}

// API functions
export async function getOffices(): Promise<Office[]> {
  const res = await fetchApi<Office[] | { results: Office[] }>('/core/offices/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function publicTrackParcel(code: string): Promise<Parcel> {
  return fetchApi<Parcel>(`/parcels/track/?code=${encodeURIComponent(code)}`);
}

export async function customerLogin(
  phone_number: string,
  password: string
): Promise<{ token: string; user: User }> {
  const res = await fetchApi<{ token: string; user: User }>('/core/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ phone_number, password }),
  });
  setAuthToken(res.token);
  setStoredUser(res.user);
  return res;
}

export async function customerRegister(
  phone_number: string,
  password: string,
  full_name: string,
  preferred_language: 'fr' | 'ar' = 'fr'
): Promise<{ token: string; user: User }> {
  const res = await fetchApi<{ token: string; user: User }>('/core/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ phone_number, password, full_name, preferred_language }),
  });
  setAuthToken(res.token);
  setStoredUser(res.user);
  return res;
}

export async function getMyParcels(): Promise<Parcel[]> {
  const res = await fetchApi<Parcel[] | { results: Parcel[] }>('/parcels/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function createParcelRequest(data: NewParcelPayload): Promise<Parcel> {
  return fetchApi<Parcel>('/parcels/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
