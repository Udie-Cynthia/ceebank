import { useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || '';

export default function TransferPage() {
  const [toAccount, setToAccount] = useState('');
  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const email = localStorage.getItem('ceebank_email') || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return alert('Please log in again.');
    if (!amount || amount <= 0) return alert('Enter a valid amount.');
    if (pin.length !== 4) return alert('PIN must be 4 digits.');

    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pin,
          toAccount,
          toName,
          toEmail: toEmail || undefined,
          amount: Number(amount),
          description: description || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || `HTTP ${r.status}`);
      alert(`Success! Ref: ${data.reference}\nNew balance: ₦${data.balance.toLocaleString()}`);
    } catch (e: any) {
      alert(`Transfer failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transfer</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Destination Account" value={toAccount} onChange={setToAccount} placeholder="GTB-22334455" />
        <Field label="Recipient Name" value={toName} onChange={setToName} placeholder="John Doe" />
        <Field label="Recipient Email (optional)" value={toEmail} onChange={setToEmail} type="email" placeholder="john@email.com" />
        <Field
          label="Amount (NGN)"
          value={amount}
          onChange={(v) => setAmount(v.replace(/\D/g, '') ? Number(v.replace(/\D/g, '')) : '')}
          inputMode="numeric"
          placeholder="5000"
        />
        <Field label="Description (optional)" value={description} onChange={setDescription} placeholder="Rent, food, etc." />
        <Field
          label="Transaction PIN (4 digits)"
          value={pin}
          onChange={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          type="password"
          placeholder="1234"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  inputMode,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm">{label}</label>
      <input
        className="w-full border rounded-lg px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </div>
  );
}
