import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || '';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('ceebank_email', data.user.email);
      localStorage.setItem('access_token', data.accessToken);
      if (!staySignedIn) {
        // if you want session-only behavior, you could mirror to sessionStorage, etc.
      }
      nav('/dashboard');
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        {/* Tight checkbox */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-black"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
          />
          <span>Stay signed in for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {/* Tight Terms line under form */}
        <p className="text-xs text-gray-600">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        <p className="text-sm">
          No account? <Link to="/register" className="underline">Create one</Link>
        </p>
      </form>
    </div>
  );
}
