import React, { useState } from "react";

export default function AirtimePage() {
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [amount, setAmount] = useState<number>(1000);
  const [note, setNote] = useState<string | null>(null);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setNote("Processing…");
    // TODO: call backend /api/payments/airtime (we’ll add later)
    setTimeout(() => setNote("Airtime purchase simulated successfully."), 600);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold">Buy Airtime</h1>
      <form className="mt-4 space-y-3" onSubmit={handleBuy}>
        <label className="block text-sm">Phone</label>
        <input className="w-full border rounded-xl p-3" value={phone} onChange={e=>setPhone(e.target.value)} required />

        <label className="block text-sm">Network</label>
        <select className="w-full border rounded-xl p-3" value={network} onChange={e=>setNetwork(e.target.value)}>
          <option>MTN</option><option>Glo</option><option>Airtel</option><option>9mobile</option>
        </select>

        <label className="block text-sm">Amount (₦)</label>
        <input type="number" min={50} className="w-full border rounded-xl p-3" value={amount} onChange={e=>setAmount(Number(e.target.value))} required />

        <button className="w-full rounded-2xl bg-black text-white py-3 mt-2">Buy</button>
      </form>
      {note && <p className="mt-3 text-sm text-gray-700">{note}</p>}
    </div>
  );
}
