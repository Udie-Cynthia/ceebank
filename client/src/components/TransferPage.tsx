import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function TransferPage() {
  const email = localStorage.getItem('ceebank.email') || '';
  const [pin, setPin] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [toName, setToName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onPinChange(v: string) {
    const vv = v.replace(/\D/g, '').slice(0,4);
    setPin(vv);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setErr(null);
    if (!email) return setErr('No session email. Please sign in again.');
    if (!pin || pin.length !== 4) return setErr('Enter your 4-digit PIN.');
    if (!amount || Number(amount) <= 0) return setErr('Enter a valid amount.');

    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, pin,
          toAccount: toAccount.trim(),
          toName: toName.trim(),
          amount: Number(amount),
          description: description.trim()
        })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) throw new Error(j?.error || `HTTP ${r.status}`);
      setOk(j?.message || 'Transfer successful');
    } catch (e: any) {
      setErr(e?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-6">Transfer</h1>

        {err && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}
        {ok && <div className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-3 py-2">{ok}</div>}

        <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl shadow p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">To Account</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="GTB-22334455"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Ada"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (NGN)</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="5000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PIN (4 digits)</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 tracking-widest"
                value={pin}
                onChange={(e) => onPinChange(e.target.value)}
                placeholder="1234"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment for…"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black text-white px-4 py-2.5 font-medium hover:bg-black/90 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
