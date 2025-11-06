import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || '';

type AccountResp = {
  ok: boolean;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [acct, setAcct] = useState<AccountResp | null>(null);
  const email = localStorage.getItem('ceebank_email') || '';

  useEffect(() => {
    (async () => {
      try {
        if (!email) throw new Error('No email in session. Please log in.');
        const r = await fetch(`${API}/api/auth/account?email=${encodeURIComponent(email)}`);
        if (!r.ok) throw new Error(`Account HTTP ${r.status}`);
        const data = await r.json();
        if (!data.ok) throw new Error('Account error');
        setAcct(data);
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  if (loading) return <div className="p-6">Loading dashboard…</div>;
  if (!acct?.ok) return <div className="p-6 text-red-600">Couldn’t load your account.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome back, {acct.name}</h1>
        <Link to="/transfer" className="underline">Make a Transfer</Link>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-gray-600">Account</div>
        <div className="text-lg font-medium">{acct.accountNumber}</div>
        <div className="mt-2 text-gray-600">Balance</div>
        <div className="text-2xl font-semibold">₦{acct.balance.toLocaleString()}</div>
      </div>

      <QuickActionsInline />
    </div>
  );
}

function QuickActionsInline() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <ActionTile to="/airtime" title="Buy Airtime" desc="Top up any network instantly." />
        <ActionTile to="/transfer" title="Transfer" desc="Send money to banks & wallets." />
        <ActionTile to="/bills" title="Pay Bills" desc="Utility, TV, internet, more." />
        <ActionTile to="/loans" title="Loans" desc="Quick demo loans & offers." />
        <ActionTile to="/cards" title="Virtual Cards" desc="Create and manage virtual cards." />
        <ActionTile to="/qr" title="QR Payments" desc="Scan & pay at merchants." />
      </div>
    </div>
  );
}

function ActionTile({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="rounded-xl p-4 shadow hover:shadow-md block">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </Link>
  );
}
