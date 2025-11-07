import React, { useEffect, useMemo, useState } from "react";
import QuickActions from "../components/QuickActions";

/* -------- Types -------- */
type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

type StoredUser = {
  email?: string;
  name?: string;
  accountNumber?: string;
  balance?: number;
};

/* -------- Helpers -------- */
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "/api";

const formatNGN = (v: number | undefined) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    typeof v === "number" ? v : 0
  );

const safeGetStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem("ceebank_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

/* -------- Component -------- */
export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load any cached user first so the UI doesn’t show placeholders
  const cached = useMemo(() => safeGetStoredUser(), []);
  const cachedEmail = cached?.email;

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        // If we already have a fully-hydrated account in storage, show it instantly.
        if (cached?.email && cached?.name && cached?.accountNumber && typeof cached?.balance === "number") {
          setAccount({
            email: cached.email,
            name: cached.name!,
            accountNumber: cached.accountNumber!,
            balance: cached.balance!,
          });
        }

        // Always try to refresh from the API when we have an email
        if (!cachedEmail) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/account?email=${encodeURIComponent(cachedEmail)}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          // Keep whatever we had (cached or null), but stop loading
          setLoading(false);
          return;
        }

        const data = await res.json();
        // Expected shape from server: { ok: true, email, name, accountNumber, balance }
        if (data?.ok && !cancelled) {
          const next: Account = {
            email: data.email,
            name: data.name,
            accountNumber: data.accountNumber,
            balance: data.balance,
          };
          setAccount(next);

          // Store refreshed snapshot for Home/Dashboard parity
          localStorage.setItem(
            "ceebank_user",
            JSON.stringify({
              email: next.email,
              name: next.name,
              accountNumber: next.accountNumber,
              balance: next.balance,
            })
          );
        }
      } catch {
        // Ignore network errors; show whatever we have
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [cachedEmail, cached]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Page Title */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Your account overview and quick actions.</p>
      </header>

      {/* Overview Card */}
      <section className="grid gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Welcome + Meta */}
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Welcome</h2>
              <p className="mt-1 text-lg font-semibold">
                {loading ? "—" : account?.name || "—"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Account Number</h2>
              <p className="mt-1 font-mono text-lg">
                {loading ? "—" : account?.accountNumber || "—"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Available Balance</h2>
              <p className="mt-1 text-2xl font-bold">{formatNGN(account?.balance)}</p>
            </div>
          </div>

          {/* Signed-out notice */}
          {!loading && !account?.email && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Not signed in. Please sign in to view your dashboard.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Quick Actions</h3>
          </div>
          <QuickActions />
        </div>
      </section>
    </main>
  );
}
