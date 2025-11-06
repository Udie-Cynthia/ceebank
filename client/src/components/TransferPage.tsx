import React, { useState } from 'react';
import { apiPost, getSavedUser } from '../lib/api';

type TransferResp =
  | { ok: true; reference: string; balance: number; message: string }
  | { ok: false; error: string };

export default function TransferPage() {
  const saved = getSavedUser();

  const [toAccount, setToAccount] = useState('GTB-22334455');
  const [toName, setToName] = useState('Recipient');
  const [amount, setAmount] = useState<number>(5000);
  const [description, setDescription] = useState('Payment');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null); setErr(null);

    if (!saved?.email) { setErr('You are not signed in.'); return; }
    if (!/^\d{4}$/.test(pin)) { setErr('PIN must be exactly 4 digits.'); return; }
    if (!amount || amount <= 0) { setErr('Amount must be greater than 0.'); return; }

    setLoading(true);
    try {
      const j = await apiPost<TransferResp>('/transactions/transfer', {
        email: saved.email,
        pin,
        toAccount,
        toName,
        amount,
        description
      });
      if ('ok' in j && j.ok) {
        setOkMsg(`${j.message}. Ref: ${j.reference}. New balance: ₦${j.balance.toLocaleString('en-NG')}`);
        setPin('');
      } else {
        throw new Error(j?.error || 'Transfer failed');
      }
    } catch (e: any) {
      setErr(e.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Transfer</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border p-5 bg-white">
        <div className="space-y-1">
          <label className="text-sm font-medium">To Account</label>
          <input className="w-full rounded-xl border px-3 py-2" value={toAccount} onChange={e=>setToAccount(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Recipient Name</label>
          <input className="w-full rounded-xl border px-3 py-2" value={toName} onChange={e=>setToName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Amount (₦)</label>
          <input type="number" className="w-full rounded-xl border px-3 py-2"
                 value={amount} min={1} onChange={e=>setAmount(parseInt(e.target.value || '0',10))} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <input className="w-full rounded-xl border px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Transaction PIN (4 digits)</label>
          <input inputMode="numeric" pattern="\d{4}" maxLength={4}
                 className="w-full rounded-xl border px-3 py-2"
                 value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                 placeholder="1234" required />
        </div>

        {err && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{err}</div>}
        {okMsg && <div className="rounded-lg bg-green-50 text-green-700 text-sm p-3">{okMsg}</div>}

        <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
          {loading ? 'Sending…' : 'Send money'}
        </button>
      </form>
    </div>
  );
}
