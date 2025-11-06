// client/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiGet<T>(path: string) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: 'omit' });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data as T;
}

export async function apiPost<T>(path: string, body: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data as T;
}

// Minimal local user cache: we only need email (+optional name/accountNumber)
export type SavedUser = { email: string; name?: string; accountNumber?: string };
export function getSavedUser(): SavedUser | null {
  try {
    const raw = localStorage.getItem('ceebank_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
export function saveUser(u: SavedUser) {
  localStorage.setItem('ceebank_user', JSON.stringify(u));
}
export function clearUser() {
  localStorage.removeItem('ceebank_user');
}
