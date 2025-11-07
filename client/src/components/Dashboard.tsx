// client/src/components/Dashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import QuickActions from './QuickActions';

// If your app exposes a hook/context for the signed-in account, import it.
// This matches what we used on Home: email/name/accountNumber/balance.
import { useAccount } from '../hooks/useAccount';

export default function Dashboard() {
  const { email, name, accountNumber, balance } = useAccount();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Page title */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Your account overview and quick actions.</p>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Welcome</div>
          <div className="mt-1 text-lg font-medium text-gray-900">
            {name || '—'}
          </div>
          <div className="mt-4 text-xs text-gray-500">Account Number</div>
          <div className="mt-1 font-mono text-gray-900">
            {accountNumber || '—'}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Available Balance</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {typeof balance === 'number'
              ? new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  maximumFractionDigits: 0,
                }).format(balance)
              : '₦0'}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Profile</div>
            <div className="mt-1 text-sm text-gray-900 truncate max-w-[14rem]">
              {email || '—'}
            </div>
          </div>
          <Link
            to="/transfer"
            className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Make a Transfer
          </Link>
        </div>
      </section>

      {/* Quick Actions (single heading only) */}
      <section aria-labelledby="qa-title">
        <div className="flex items-center justify-between mb-3">
          <h2 id="qa-title" className="text-base font-medium text-gray-900">
            Quick Actions
          </h2>
          <Link
            to="/transfer"
            className="text-sm text-blue-600 hover:underline"
          >
            Go to Transfer
          </Link>
        </div>

        {/* Keep the existing QuickActions grid/cards.
            If your QuickActions supports props, pass them as needed.
            We do NOT render an extra “Quick Actions” text anywhere else. */}
        <QuickActions />
      </section>
    </div>
  );
}
