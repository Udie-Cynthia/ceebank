// client/src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type AccountResponse =
  | {
      ok: true;
      email: string;
      name: string;
      accountNumber: string;
      balance: number;
    }
  | {
      ok: false;
      error: string;
    };

function formatCurrencyNaira(amount: number) {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback
    return `₦${(amount ?? 0).toLocaleString('en-NG')}`;
  }
}

export default function Home() {
  // Session hydration (set in Login/Signup steps)
  const storedEmail = useMemo(() => localStorage.getItem('ceebank.email') || '', []);
  const storedName = useMemo(() => localStorage.getItem('ceebank.name') || '', []);
  const [loading, setLoading] = useState<boolean>(!!storedEmail);
  const [error, setError] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(4000000);
  const displayName = storedName || (storedEmail ? storedEmail.split('@')[0] : '');
  // ADDED: seed the JSON key Dashboard expects (name/email) so it can greet immediately
useEffect(() => {
  if (storedEmail || storedName) {
    try {
      localStorage.setItem(
        'ceebankUser',
        JSON.stringify({
          name: storedName || (storedEmail ? storedEmail.split('@')[0] : ''),
          email: storedEmail || ''
        })
      );
    } catch {}
  }
}, [storedEmail, storedName]);


  useEffect(() => {
    let abort = false;

    async function load() {
      if (!storedEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://ceebank.online/api/auth/account?email=${encodeURIComponent(storedEmail)}`
        );
        const data: AccountResponse = await res.json();

        if (abort) return;

        if ('ok' in data && data.ok) {
          setAccountNumber(data.accountNumber);
          setBalance(data.balance);
          // Keep local cache in case we want to show immediately next time
          localStorage.setItem('ceebank.accountNumber', data.accountNumber);
          localStorage.setItem('ceebank.balance', String(data.balance));
            // ADDED: also write the JSON blobs that Dashboard is already reading
  try {
    localStorage.setItem(
      'ceebankUser',
      JSON.stringify({
        name: data.name,
        email: storedEmail
      })
    );
    localStorage.setItem(
      'ceebankAccount',
      JSON.stringify({
        accountNumber: data.accountNumber,
        balance: data.balance
      })
    );
  } catch {}

        } else {
          setError(data.error || 'Unable to load account.');
        }
      } catch (e: any) {
        setError('Network error while fetching account.');
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();

    return () => {
      abort = true;
    };
  }, [storedEmail]);

  // If not signed in, show a clean prompt
  if (!storedEmail) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        <section style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Welcome to CeeBank</h1>
          <p style={{ marginTop: 8, color: '#444' }}>
            Sign in to view your account overview, balance, and recent activity.
          </p>
        </section>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <p style={{ marginTop: 0, marginBottom: 12 }}>
            Already have an account?
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              background: '#0f766e',
              color: 'white',
              fontWeight: 600,
            }}
          >
            Sign In
          </Link>

          <p style={{ marginTop: 16, marginBottom: 8 }}>New to CeeBank?</p>
          <Link to="/register" style={{ textDecoration: 'none', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Page title (no duplicate headers) */}
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          {displayName ? `Welcome, ${displayName}` : 'Welcome'}
        </h1>
        <p style={{ marginTop: 8, color: '#444' }}>
          Your account overview
        </p>
      </header>

      {/* States */}
      {loading && (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            background: '#fafafa',
            marginBottom: 16,
          }}
        >
          <p style={{ margin: 0 }}>Loading account…</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#7f1d1d',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Overview cards */}
      {!loading && !error && (
        <section
          aria-label="Account Overview"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              background: 'white',
            }}
          >
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Account Number</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {accountNumber || localStorage.getItem('ceebank.accountNumber') || '—'}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              background: 'white',
            }}
          >
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Current Balance</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {balance !== null
                ? formatCurrencyNaira(balance)
                : formatCurrencyNaira(
                    Number(localStorage.getItem('ceebank.balance') || '0') || 0
                  )}
            </div>
          </div>
        </section>
      )}

      {/* Quick next actions */}
      <section
        aria-label="Quick Actions"
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          background: 'white',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Quick actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link
            to="/transfer"
            style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              background: '#0f766e',
              color: 'white',
              fontWeight: 600,
            }}
          >
            Make a Transfer
          </Link>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              background: '#334155',
              color: 'white',
              fontWeight: 600,
            }}
          >
            View Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
