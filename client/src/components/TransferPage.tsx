import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function TransferPage() {
  const [toAccount, setToAccount] = useState("");
  const [toName, setToName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [pin, setPin] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const email = localStorage.getItem("ceebank_email") || "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email) {
      setMsg("Please login first.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/transactions/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pin,
          toAccount,
          toName,
          // Optional field for receipts. If your backend ignores it, that's fine.
          toEmail: "",
          amount: Number(amount),
          description,
        }),
      });
      const data = await r.json();
      if (r.ok && data?.ok) {
        setMsg(
          `✓ ${data.message} · Ref: ${data.reference} · New balance: ₦${(data.balance || 0).toLocaleString()}`
        );
        setToAccount("");
        setToName("");
        setAmount(0);
        setPin("");
        setDescription("");
      } else {
        setMsg(`✗ ${data?.error || "Transfer failed"}`);
      }
    } catch {
      setMsg("✗ Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7FAFC] text-slate-800">
      <section className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Transfer</h1>
        <form onSubmit={submit} className="space-y-4 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div>
            <label className="block text-sm mb-1">Recipient Account</label>
            <input
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              placeholder="GTB-22334455"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Recipient Name</label>
            <input
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="Cynthia"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Amount (₦)</label>
            <input
              type="number"
              min="1"
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">4-digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="****"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description (optional)</label>
            <input
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Note to self"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60 px-4 py-2 font-medium"
          >
            {busy ? "Processing..." : "Send"}
          </button>
        </form>
        {msg && <p className="mt-4">{msg}</p>}
      </section>
      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © 2025 Cynthia Ud ie. All rights reserved.
      </footer>
    </main>
  );
}
