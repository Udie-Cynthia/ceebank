import { useEffect, useState } from "react";
import QuickActions from "./QuickActions";

type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export default function Dashboard() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const email =
      localStorage.getItem("ceebank.email") ||
      sessionStorage.getItem("ceebank.email");

    if (!email) {
      setErr("Please sign in to view your account.");
      setLoading(false);
      return;
    }

    const fetchAcct = async () => {
      try {
        const r = await fetch(`/api/auth/account?email=${encodeURIComponent(email)}`);
        const j = await r.json();
        if (!r.ok || j.ok === false) {
          setErr(j.error || `Error ${r.status}`);
        } else {
          // API returns shape: { ok:true, email, name, accountNumber, balance }
          const a: Account = {
            email: j.email,
            name: j.name,
            accountNumber: j.accountNumber,
            balance: Number(j.balance ?? 0),
          };
          setAcct(a);
        }
      } catch (e: any) {
        setErr(e?.message || "Failed to load account");
      } finally {
        setLoading(false);
      }
    };

    fetchAcct();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {loading && <div className="mt-4 text-gray-600">Loading account…</div>}

      {!loading && err && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3">
          {err}
        </div>
      )}

      {!loading && acct && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Welcome</div>
            <div className="text-lg font-medium mt-1">{acct.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              Account Number: <span className="font-mono">{acct.accountNumber}</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Available Balance</div>
            <div className="text-2xl font-semibold mt-1">
              ₦{(acct.balance ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <QuickActions />
    </div>
  );
}
