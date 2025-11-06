import React, { useState } from 'react';
import { apiPost, saveUser } from '../lib/api';

type LoginResp =
  | { ok: true; user: { email: string; name: string; accountNumber: string }; accessToken: string; refreshToken: string }
  | { ok: false; error: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stay, setStay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const j = await apiPost<LoginResp>('/auth/login', { email, password });
      if ('ok' in j && j.ok) {
        saveUser({ email: j.user.email, name: j.user.name, accountNumber: j.user.accountNumber });
        window.location.href = '/';
      } else {
        throw new Error(j?.error || 'Login failed');
      }
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-5 bg-white">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input className="w-full rounded-xl border px-3 py-2"
                 type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input className="w-full rounded-xl border px-3 py-2"
                 type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stay} onChange={e=>setStay(e.target.checked)} />
            <span className="text-sm">Stay signed in for 30 days</span>
          </label>
          <a className="text-sm text-blue-600 hover:underline" href="#">Forgot password?</a>
        </div>

        {err && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{err}</div>}

        <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-600 pt-2">
          <span>By signing in, you agree to our</span>
          <a className="text-blue-600 hover:underline" href="#">Terms of Service</a>
          <span>and</span>
          <a className="text-blue-600 hover:underline" href="#">Privacy Policy</a>
        </div>
      </form>
    </div>
  );
}
