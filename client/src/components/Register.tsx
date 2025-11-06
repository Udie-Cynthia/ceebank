import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onPinChange(v: string) {
    // Allow digits only, max 4
    const vv = v.replace(/\D/g, '').slice(0, 4);
    setPin(vv);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!agree) {
      setErr('Please agree to the Terms and Privacy Policy.');
      return;
    }
    if (pin.length !== 4) {
      setErr('Please choose a 4-digit transaction PIN.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim(), pin }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) {
        throw new Error(j?.error || `HTTP ${r.status}`);
      }
      setOk('Account created. Please sign in.');
      // Keep email to prefill login
      localStorage.setItem('ceebank.email', email.trim());
      nav('/login');
    } catch (e: any) {
      setErr(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="w-8 h-8" />
          <h1 className="text-xl font-semibold">Create your CeeBank account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              required
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction PIN (4 digits)
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 tracking-widest"
                value={pin}
                onChange={(e) => onPinChange(e.target.value)}
                placeholder="1234"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Tight checkbox + ToS line */}
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Stay signed in for 30 days</span>
            </label>

            <p className="text-xs text-gray-500 leading-snug">
              By creating an account, you agree to our&nbsp;
              <a href="/terms" className="underline">Terms of Service</a> and&nbsp;
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </div>

          {err && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}
          {ok && <div className="rounded-lg bg-green-50 text-green-700 text-sm px-3 py-2">{ok}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2.5 font-medium hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div className="text-sm text-center text-gray-600">
            Already have an account? <Link to="/login" className="underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
