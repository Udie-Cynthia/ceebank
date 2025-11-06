import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${r.status}`);
      }
      const j = await r.json();
      // Persist what we need for Dashboard / transfers
      localStorage.setItem('ceebank.email', email.trim());
      localStorage.setItem('ceebank.name', j?.user?.name ?? '');
      localStorage.setItem('ceebank.accessToken', j?.accessToken ?? '');
      localStorage.setItem('ceebank.refreshToken', j?.refreshToken ?? '');
      if (staySignedIn) {
        // tiny extension: keep a flag (so you can later choose longer token TTLs)
        localStorage.setItem('ceebank.stay', '1');
      } else {
        localStorage.removeItem('ceebank.stay');
      }
      nav('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="w-8 h-8" />
          <h1 className="text-xl font-semibold">Sign in to CeeBank</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Tight checkbox pair */}
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Stay signed in for 30 days</span>
            </label>

            <p className="text-xs text-gray-500 leading-snug">
              By creating an account, you agree to our&nbsp;
              <a href="/terms" className="underline">Terms of Service</a> and&nbsp;
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </div>

          {err && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2.5 font-medium hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="text-sm text-center text-gray-600">
            No account? <Link to="/register" className="underline">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
