// client/src/components/DashboardLive.tsx
// Live dashboard: fetches account + transactions from the API
// and provides a Transfer form that posts to /api/transactions/transfer.

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

      // IMPORTANT: relative URLs so they go through Nginx on the same origin (HTTPS)
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

      // Update local state: new balance + prepend the new tx
      setAccount(json.account);
      // Best to reload to get the latest transactions ordering from server
      await loadData();

      // Reset form
      setTo("");
      setAmount(0);
      setDesc("");
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  if (loading) return <p style={{ color: "#64748b" }}>Loading dashboard…</p>;
  if (error)
    return (
      <div
        style={{
          padding: 12,
          border: "1px solid #fecaca",
          background: "#fee2e2",
          borderRadius: 8,
          color: "#991b1b",
        }}
      >
        Error: {error}
      </div>
    );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Account card */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Available Balance</h2>
        <p style={{ fontSize: 28, margin: 0 }}>
          <strong>
            ₦
            {(account?.balance ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </strong>
        </p>
        <p style={{ color: "#64748b", marginTop: 6 }}>
          Demo funds for showcasing UI only.
        </p>
      </div>

      {/* Transfer console */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Transfer</h3>
        <form
          onSubmit={onTransfer}
          style={{ display: "grid", gap: 10, maxWidth: 520 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>To (Account/Bank Ref)</span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="GTB-22334455"
              required
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Amount (₦)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              type="number"
              min={1}
              step="0.01"
              required
              placeholder="50000"
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description (optional)</span>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Rent, groceries, etc."
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #0ea5e9",
              background: "#0ea5e9",
              color: "white",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Transactions */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Recent Transactions</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "10px 6px" }}>Date</th>
              <th style={{ padding: "10px 6px" }}>Description</th>
              <th style={{ padding: "10px 6px", textAlign: "right" }}>Amount</th>
              <th style={{ padding: "10px 6px", textAlign: "right" }}>
                Balance After
              </th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 6px" }}>{t.date}</td>
                <td style={{ padding: "10px 6px" }}>{t.description}</td>
                <td
                  style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    color: t.amount < 0 ? "#dc2626" : "#16a34a",
                  }}
                >
                  {t.amount < 0 ? "-" : "+"}₦
                  {Math.abs(t.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={{ padding: "10px 6px", textAlign: "right" }}>
                  ₦
                  {t.balanceAfter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "10px 6px", color: "#64748b" }}>
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
