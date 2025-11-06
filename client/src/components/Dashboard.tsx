import React, { useEffect, useState } from 'react';
import { apiGet, getSavedUser } from '../lib/api';
import QuickActions from './QuickActions';

type AccountOk = { ok: true; email: string; name: string; accountNumber: string; balance: number };
type AccountResp = AccountOk | { ok: false; error: string };

export default function Dashboard() {
  const saved = getSavedUser();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [acct, setAcct] = useState<AccountOk | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        if (!saved?.email) throw new Error('You are not signed in.');
        const j = await apiGet<AccountResp>(`/auth/account?email=${encodeURIComponent(saved.email)}`);
        if ('ok' in j && j.ok) setAcct(j);
        else throw new Error(j?.error || 'Account not found');
      } catch (e: any) {
        setErr(e.message || 'Failed to fetch account');
      } finally {
        setLoading(false);
      }
    })();
  }, [saved?.email]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {loading && <div className="rounded-lg border p-4">Loading account…</div>}
      {!loading && err && <div className="rounded-lg border p-4 bg-red-50 text-red-700">{err}</div>}

      {!loading && acct && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border p-5 bg-white">
            <div className="text-sm text-gray-600">Available balance</div>
            <div className="text-3xl font-semibold mt-1">₦{acct.balance.toLocaleString('en-NG')}</div>
            <div className="mt-4 text-sm">
              <div><span className="text-gray-600">Account name:</span> {acct.name}</div>
              <div><span className="text-gray-600">Account number:</span> {acct.accountNumber}</div>
            </div>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="text-sm text-gray-600">Profile</div>
            <div className="mt-2 text-sm">
              <div className="font-medium">{acct.name}</div>
              <div className="text-gray-600">{acct.email}</div>
            </div>
          </div>
        </div>
      )}

      <QuickActions />
    </div>
  );
}
