// client/src/components/DashboardLive.tsx
// Live dashboard (styled): account card, transfer card, transactions table.

import React from "react";

type Account = { userId: string; balance: number; currency: string };
type Tx = {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  balanceAfter: number;
};

export default function DashboardLive() {
  const [account, setAccount] = React.useState<Account | null>(null);
  const [txs, setTxs] = React.useState<Tx[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Transfer form state
  const [to, setTo] = React.useState("");
  const [amount, setAmount] = React.useState<number>(0);
  const [desc, setDesc] = React.useState("");

  async function loadData() {
    try {
      setError(null);
      setLoading(true);

      const [accRes, txRes] = await Promise.all([
        fetch("/api/account"),
        fetch("/api/transactions?limit=10"),
      ]);
      if (!accRes.ok) throw new Error(`Account HTTP ${accRes.status}`);
      if (!txRes.ok) throw new Error(`Transactions HTTP ${txRes.status}`);

      const accJson = await accRes.json();
      const txJson = await txRes.json();

      setAccount(accJson);
      setTxs(txJson.transactions ?? []);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  async function onTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount <= 0 || !to.trim()) return;

    try {
      setError(null);
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, amount: Number(amount), description: desc }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Transfer HTTP ${res.status}`);
      }
      const json = await res.json();

      setAccount(json.account);
      await loadData(); // refresh list

      setTo("");
      setAmount(0);
      setDesc("");
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  if (loading) return <p className="text-muted">Loading dashboard…</p>;
  if (error)
    return (
      <div className="card" style={{ borderColor: "#fecaca", background: "#fee2e2", color: "#991b1b" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="grid">
      {/* Account card */}
      <section className="card" aria-label="Account balance">
        <div className="kicker">Available Balance</div>
        <div className="balance">
          ₦
          {(account?.balance ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>
        <p className="text-muted" style={{ marginTop: 6 }}>
          Demo funds for showcasing UI only.
        </p>
      </section>

      {/* Transfer console */}
      <section className="card" aria-label="Transfer">
        <h3 style={{ marginTop: 0 }}>Transfer</h3>
        <form onSubmit={onTransfer} className="grid" style={{ maxWidth: 520 }}>
          <label className="grid">
            <span className="kicker">To (Account/Bank Ref)</span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="GTB-22334455"
              required
            />
          </label>

          <label className="grid">
            <span className="kicker">Amount (₦)</span>
            <input
              value={Number.isNaN(amount) ? "" : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              type="number"
              min={1}
              step="0.01"
              required
              placeholder="50000"
            />
          </label>

          <label className="grid">
            <span className="kicker">Description (optional)</span>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Rent, groceries, etc."
            />
          </label>

          <div>
            <button type="submit">Send</button>
          </div>
        </form>
      </section>

      {/* Transactions */}
      <section className="card" aria-label="Recent transactions">
        <h3 style={{ marginTop: 0 }}>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td style={{ textAlign: "right", color: t.amount < 0 ? "#dc2626" : "#16a34a" }}>
                  {t.amount < 0 ? "-" : "+"}₦
                  {Math.abs(t.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={{ textAlign: "right" }}>
                  ₦
                  {t.balanceAfter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
