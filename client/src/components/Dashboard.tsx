import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Account = {
  ok: boolean;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // transfer form
  const [toAccount, setToAccount] = useState("");
  const [toName, setToName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState<string | null>(null);

  // get email from localStorage (saved at login/register)
  const email = (typeof window !== "undefined" && localStorage.getItem("email")) || "";

  useEffect(() => {
    async function load() {
      if (!email) {
        setError("You’re not signed in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/auth/account?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "Failed to load account");
        setAccount(json);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [email]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      navigate("/login");
      return;
    }
    setNote("Processing transfer…");
    try {
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pin,
          toAccount,
          toName,
          amount: Number(amount),
          description,
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      // update balance locally
      setAccount((prev) =>
        prev ? { ...prev, balance: json.balance ?? prev.balance } : prev
      );
      setNote(`✅ ${json.message || "Transfer successful"}`);
      // clear fields (keep PIN for convenience)
      setToAccount("");
      setToName("");
      setAmount(0);
      setDescription("");
    } catch (err: any) {
      setNote(`❌ ${err.message || "Transfer failed"}`);
    }
  }

  if (!email) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold">CeeBank</h1>
        <p className="mt-3 text-sm text-gray-700">
          You’re signed out. Please{" "}
          <Link className="underline" to="/login">log in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome{account?.name ? `, ${account.name}` : ""}</h1>
          <p className="text-sm text-gray-600">Acct: {account?.accountNumber || "—"}</p>
        </div>
        <Link to="/transfer" className="rounded-2xl bg-black text-white px-4 py-2">
          Quick Transfer
        </Link>
      </header>

      {/* Balance / status */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border p-5">
          <div className="text-sm text-gray-600">Available Balance</div>
          <div className="mt-1 text-3xl font-semibold">
            {loading ? "…" : `₦${(account?.balance ?? 0).toLocaleString()}`}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border p-5">
          <div className="font-semibold">Quick Actions</div>
          <div className="mt-3 grid gap-2">
            <Link to="/airtime" className="rounded-xl border px-3 py-2 hover:shadow">Buy Airtime</Link>
            <Link to="/transfer" className="rounded-xl border px-3 py-2 hover:shadow">Transfer</Link>
            <Link to="/bills" className="rounded-xl border px-3 py-2 hover:shadow">Pay Bills</Link>
            <Link to="/loans" className="rounded-xl border px-3 py-2 hover:shadow">Loans</Link>
            <Link to="/cards" className="rounded-xl border px-3 py-2 hover:shadow">Virtual Cards</Link>
            <Link to="/qr" className="rounded-xl border px-3 py-2 hover:shadow">QR Payments</Link>
          </div>
        </div>
      </section>

      {/* Transfer form (inline on dashboard for convenience) */}
      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold">Transfer</h2>
        <form className="mt-4 grid md:grid-cols-2 gap-4" onSubmit={onSend}>
          <div>
            <label className="block text-sm text-gray-700">To (Account/Bank Ref)</label>
            <input
              className="mt-1 w-full border rounded-xl p-3"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              placeholder="GTB-22334455"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Recipient Name</label>
            <input
              className="mt-1 w-full border rounded-xl p-3"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="e.g., Cynthia"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Amount (₦)</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full border rounded-xl p-3"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">4-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              className="mt-1 w-full border rounded-xl p-3 tracking-widest"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Description (optional)</label>
            <input
              className="mt-1 w-full border rounded-xl p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rent, groceries, etc."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button className="rounded-2xl bg-black text-white px-5 py-3">Send</button>
            {note && <span className="text-sm text-gray-700">{note}</span>}
          </div>
        </form>
      </section>

      {/* Recent Transactions (optional placeholder; can be wired later) */}
      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <p className="mt-2 text-sm text-gray-600">
          You’ll see your latest transfers here.
        </p>
      </section>
    </div>
  );
}
