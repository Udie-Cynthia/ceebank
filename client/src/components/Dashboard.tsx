import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function Dashboard() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email = localStorage.getItem("ceebank_email") || "";

  useEffect(() => {
    if (!email) {
      setError("Please login first.");
      return;
    }
    fetch(`${API_BASE}/auth/account?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (data?.ok) setAcct(data as Account);
        else setError(data?.error || "Could not load account");
      })
      .catch(() => setError("Network error loading account"));
  }, [email]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7FAFC] text-slate-800">
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">
            {acct ? `Hello ${acct.name}, welcome to your CeeBank account` : "Dashboard"}
          </h1>
          {acct && (
            <p className="mt-2 text-slate-600">
              Account Number: <span className="font-mono">{acct.accountNumber}</span> • Balance:{" "}
              <span className="font-semibold">₦{acct.balance.toLocaleString()}</span>
            </p>
          )}
          {error && <p className="mt-2 text-rose-600">{error}</p>}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: "/airtime", title: "Buy Airtime", desc: "Top up any network instantly." },
            { to: "/transfer", title: "Transfer", desc: "Send money to banks & wallets." },
            { to: "/bills", title: "Pay Bills", desc: "Utility, TV, internet, more." },
            { to: "/loans", title: "Loans", desc: "Instant loans & offers." },
            { to: "/cards", title: "Virtual Cards", desc: "Create and manage virtual cards." },
            { to: "/qr", title: "QR Payments", desc: "Scan & pay at merchants." },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="block rounded-xl bg-white border border-slate-200 p-5 hover:shadow-md transition"
            >
              <div className="text-lg font-medium">{card.title}</div>
              <div className="text-sm text-slate-600">{card.desc}</div>
            </Link>
          ))}
        </div>
      </section>
      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © 2025 Cynthia Ud ie. All rights reserved.
      </footer>
    </main>
  );
}
