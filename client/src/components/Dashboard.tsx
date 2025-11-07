// client/src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import QuickActions from './QuickActions';

type AccountOk = {
  ok: true;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

type AccountErr = { ok: false; error: string };

const formatNGN = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try to find a stored email from prior login/registration
  const storedEmail =
    localStorage.getItem('ceebank_email') ||
    localStorage.getItem('email') ||
    localStorage.getItem('auth_email') ||
    '';

  useEffect(() => {
    let cancelled = false;

    async function fetchAccount() {
      setLoading(true);
      setError(null);

      // If we don’t have an email, we can’t look up the account; show a friendly prompt
      if (!storedEmail) {
        setLoading(false);
        setError('Please sign in to view your dashboard.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/account?email=${encodeURIComponent(storedEmail)}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        const data: AccountOk | AccountErr = await res.json();

        if (cancelled) return;

        if ('ok' in data && data.ok) {
          setName(data.name || '—');
          setAccountNumber(data.accountNumber || '—');
          setBalance(typeof data.balance === 'number' ? data.balance : null);

          // Soft-hydrate localStorage so Home/other pages can reuse without another call
          localStorage.setItem('ceebank_email', data.email);
          localStorage.setItem('ceebank_name', data.name ?? '');
          localStorage.setItem('ceebank_accountNumber', data.accountNumber ?? '');
          if (typeof data.balance === 'number') {
            localStorage.setItem('ceebank_balance', String(data.balance));
          }

          // Fire a lightweight event in case any context/provider listens
          window.dispatchEvent(new CustomEvent('ceebank:account:updated', { detail: data }));
        } else {
          setError((data as AccountErr).error || 'Unable to load account.');
        }
      } catch (e) {
        setError('Network error while loading account.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAccount();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedEmail]);

  // Fallbacks in case API is slow/unavailable but we have prior values stored
  useEffect(() => {
    if (loading || name || accountNumber || balance !== null) return;
    const cachedName = localStorage.getItem('ceebank_name');
    const cachedAcct = localStorage.getItem('ceebank_accountNumber');
    const cachedBal = localStorage.getItem('ceebank_balance');

    if (cachedName) setName(cachedName);
    if (cachedAcct) setAccountNumber(cachedAcct);
    if (cachedBal && !Number.isNaN(Number(cachedBal))) setBalance(Number(cachedBal));
  }, [loading, name, accountNumber, balance]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-600">Your account overview and quick actions.</p>
      </header>

      {/* Status / error */}
      {loading && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          Loading your account…
        </div>
      )}
      {!loading && error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Welcome</div>
          <div className="mt-2 text-lg font-medium">{name ?? '—'}</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Account Number</div>
          <div className="mt-2 text-lg font-mono tracking-wide">{accountNumber ?? '—'}</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase text-gray-500">Available Balance</div>
          <div className="mt-2 text-2xl font-semibold">
            {balance !== null ? formatNGN(balance) : '—'}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <QuickActions />
      </section>
    </main>
  );
}
