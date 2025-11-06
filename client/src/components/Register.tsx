import React, { useState } from 'react';
import { apiPost, saveUser } from '../lib/api';

type RegisterResp =
  | { ok: true; message: string; user: { email: string; name: string; accountNumber?: string } }
  | { ok: false; error: string };

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [agree, setAgree] = useState(true);
  const [stay, setStay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOkMsg(null);

    if (!/^\d{4}$/.test(pin)) {
      setErr('PIN must be exactly 4 digits.');
      return;
    }
    if (!agree) {
      setErr('You must agree to Terms and Privacy.');
      return;
    }
    setLoading(true);
    try {
      const j = await apiPost<RegisterResp>('/auth/register', { email, password, name, pin });
      if ('ok' in j && j.ok) {
        setOkMsg('Registered. You can now sign in.');
        // Save minimal identity so Dashboard can pull full profile
        saveUser({ email, name });
        window.location.href = '/';
      } else {
        throw new Error(j?.error || 'Registration failed');
      }
    } catch (e: any) {
      setErr(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-5 bg-white">
        <div className="space-y-1">
          <label className="text-sm font-medium">Full name</label>
          <input className="w-full rounded-xl border px-3 py-2"
                 value={name} onChange={e=>setName(e.target.value)} required />
        </div>

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

        <div className="space-y-1">
          <label className="text-sm font-medium">Transaction PIN (4 digits)</label>
          <input inputMode="numeric" pattern="\d{4}" maxLength={4}
                 className="w-full rounded-xl border px-3 py-2"
                 value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                 placeholder="1234" required />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={stay} onChange={e=>setStay(e.target.checked)} />
          <span className="text-sm">Stay signed in for 30 days</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
          <span className="text-sm">
            By creating an account, you agree to our <a className="text-blue-600 hover:underline" href="#">Terms of Service</a> and <a className="text-blue-600 hover:underline" href="#">Privacy Policy</a>.
          </span>
        </label>

        {err && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{err}</div>}
        {okMsg && <div className="rounded-lg bg-green-50 text-green-700 text-sm p-3">{okMsg}</div>}

        <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
