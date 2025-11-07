import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Dashboard
 * - Presents an Account Summary card: Welcome, Account Number, Available Balance (large).
 * - Renders Quick Actions as a clean, evenly spaced grid of clickable tiles.
 * - Does NOT alter upstream data flow; it reads from whatever you already store.
 *   Fallbacks: localStorage + a lightweight /api/auth/account?email=... fetch (non-blocking).
 */

type Summary = {
  name?: string;
  accountNumber?: string;
  balance?: number;
  email?: string;
};

const currency = (n?: number) =>
  typeof n === 'number'
    ? n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
    : '₦0';

export default function Dashboard() {
  // 1) Try to hydrate from common places (your app state or localStorage)
  const [summary, setSummary] = useState<Summary>(() => {
    // Soft guesses where your app might put things:
    // - window.__CEEBANK
    // - localStorage.ceebankUser
    // - localStorage.ceebankAccount
    // All optional: we never hard-fail if absent.
    const fromGlobal: Partial<Summary> =
      (typeof window !== 'undefined' && (window as any).__CEEBANK) || {};

    const user =
      safeParse(localStorage.getItem('ceebankUser')) ||
      safeParse(localStorage.getItem('user')) ||
      {};

    const acct =
      safeParse(localStorage.getItem('ceebankAccount')) ||
      safeParse(localStorage.getItem('account')) ||
      {};

    // Pick best-known values; don’t override with undefined
    const name = (fromGlobal as any).name ?? user.name;
    const email = (fromGlobal as any).email ?? user.email;
    const accountNumber =
      (fromGlobal as any).accountNumber ?? acct.accountNumber ?? user.accountNumber;
    const balance =
      pickNumber((fromGlobal as any).balance) ??
      pickNumber(acct.balance) ??
      pickNumber(user.balance);

    return { name, email, accountNumber, balance };
  });

  // 2) Best-effort fetch to refresh balance/account if we know email and something’s missing
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (!summary?.email) return;
      const needs =
        !summary?.accountNumber || typeof summary?.balance !== 'number';

      if (!needs) return;

      try {
        const res = await fetch(`/api/auth/account?email=${encodeURIComponent(summary.email)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data && data.ok) {
          const next: Summary = {
            name: data.name ?? summary.name,
            email: summary.email,
            accountNumber: data.accountNumber ?? summary.accountNumber,
            balance: typeof data.balance === 'number' ? data.balance : summary.balance,
          };
          setSummary(next);

          // Keep a small mirror so other pages can reuse
          try {
            localStorage.setItem('ceebankAccount', JSON.stringify({
              accountNumber: next.accountNumber,
              balance: next.balance,
            }));
          } catch {}
        }
      } catch {
        // ignore network blips
      }
    }

    refresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.email]);

  const nameSafe = useMemo(() => summary?.name || '—', [summary?.name]);
  const acctSafe = useMemo(() => summary?.accountNumber || '—', [summary?.accountNumber]);
  const balSafe = useMemo(() => currency(summary?.balance), [summary?.balance]);

  return (
    <div style={styles.page}>
      {/* Single page title. If your shell already prints "Dashboard", feel free to remove this H1. */}
      <h1 style={styles.h1}>Dashboard</h1>

      {/* Account Summary Card */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.kicker}>Welcome</div>
            <div style={styles.nameLine}>{nameSafe}</div>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.label}>Account Number</div>
            <div style={styles.value}>{acctSafe}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.label}>Available Balance</div>
            <div style={styles.balance}>{balSafe}</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="qa-title" style={{ marginTop: 24 }}>
        <div style={styles.sectionHeader}>
          <h2 id="qa-title" style={styles.h2}>Quick Actions</h2>
        </div>

        <div style={styles.qaGrid}>
          <QATile to="/airtime" title="Buy Airtime" desc="Top up any network instantly." />
          <QATile to="/transfer" title="Transfer" desc="Send money to banks & wallets." />
          <QATile to="/bills" title="Pay Bills" desc="Utility, TV, internet, more." />
          <QATile to="/loans" title="Loans" desc="Quick loans & offers." />
          <QATile to="/cards" title="Virtual Cards" desc="Create & manage virtual cards." />
          <QATile to="/qr" title="QR Payments" desc="Scan & pay at merchants." />
        </div>
      </section>
    </div>
  );
}

/* ---------- Helpers ---------- */

function safeParse<T = any>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function pickNumber(v: any): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/* ---------- Small building blocks ---------- */

function QATile(props: { to: string; title: string; desc: string }) {
  return (
    <Link to={props.to} style={styles.qaTile} aria-label={props.title}>
      <div style={styles.qaTitle}>{props.title}</div>
      <div style={styles.qaDesc}>{props.desc}</div>
    </Link>
  );
}

/* ---------- Inline styles (framework-agnostic) ---------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '24px 16px 48px',
  },
  h1: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  h2: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    marginTop: 16,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(0,0,0,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nameLine: {
    fontSize: 18,
    fontWeight: 600,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginTop: 8,
  },
  summaryItem: {
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 10,
    padding: '12px 14px',
    background: '#fafafa',
  },
  label: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.65)',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  balance: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  qaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  qaTile: {
    display: 'block',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: '14px 16px',
    textDecoration: 'none',
    background: '#fff',
    color: '#111',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    transition: 'transform 120ms ease, box-shadow 120ms ease',
  } as React.CSSProperties,
  qaTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  qaDesc: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.65)',
    lineHeight: 1.4,
  },
};
