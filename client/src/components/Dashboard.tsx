import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || '';

type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export default function Dashboard() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const email = localStorage.getItem('ceebank.email') || '';

  useEffect(() => {
    let ignore = false;
    async function load() {
      setErr(null);
      try {
        if (!email) throw new Error('No email in session. Please sign in again.');
        const u = new URL(`${API_BASE}/auth/account`);
        u.searchParams.set('email', email);
        const r = await fetch(u.toString());
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j?.ok === false) throw new Error(j?.error || `HTTP ${r.status}`);
        if (!ignore) setAcct(j);
      } catch (e: any) {
        if (!ignore) setErr(e?.message || 'Failed to fetch account');
      }
    }
    load();
    return () => { ignore = true; };
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/ceebank-logo.svg" alt="CeeBank" className="w-8 h-8" />
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <Link to="/transfer" className="px-3 py-2 rounded-lg bg-black text-white text-sm">New transfer</Link>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>
        )}

        {acct && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="col-span-2 rounded-2xl bg-white shadow p-5">
              <div className="text-sm text-gray-500">Welcome back</div>
              <div className="text-xl font-semibold">{acct.name}</div>
              <div className="mt-4 text-sm text-gray-600">Account Number</div>
              <div className="text-lg font-mono">{acct.accountNumber}</div>
            </div>
            <div className="rounded-2xl bg-white shadow p-5">
              <div className="text-sm text-gray-500">Available Balance</div>
              <div className="text-2xl font-bold">₦{acct.balance.toLocaleString()}</div>
            </div>
          </div>
        )}

        <QuickActions />
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <ActionCard title="Buy Airtime" desc="Top up any network instantly." to="/airtime" />
        <ActionCard title="Transfer" desc="Send money to banks & wallets." to="/transfer" />
        <ActionCard title="Pay Bills" desc="Utility, TV, internet, more." to="/bills" />
        <ActionCard title="Loans" desc="Quick demo loans & offers." to="/loans" />
        <ActionCard title="Virtual Cards" desc="Create and manage virtual cards." to="/cards" />
        <ActionCard title="QR Payments" desc="Scan & pay at merchants." to="/qr" />
      </div>
    </div>
  );
}

function ActionCard({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-gray-200 hover:border-black/30 p-4 transition bg-white"
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </Link>
  );
}
