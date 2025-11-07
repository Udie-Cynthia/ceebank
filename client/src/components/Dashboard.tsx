import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Helpers ---------------- */
type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

function naira(amount: number | undefined) {
  const v = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(v);
}

/* --------------- Component --------------- */
export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const email = useMemo(() => {
    // the app writes this on login/register; keep same key
    return localStorage.getItem("cee_email") || "";
  }, []);

  useEffect(() => {
    let ok = true;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        if (!email) {
          setErr("Not signed in. Please sign in to view your dashboard.");
          setAccount(null);
          return;
        }
        const r = await fetch(`/api/auth/account?email=${encodeURIComponent(email)}`);
        if (!r.ok) {
          const msg = `HTTP ${r.status}`;
          throw new Error(msg);
        }
        const data = await r.json();
        if (ok) {
          if (data?.ok) {
            setAccount({
              email: data.email,
              name: data.name,
              accountNumber: data.accountNumber,
              balance: data.balance,
            });
          } else {
            throw new Error(data?.error || "Unable to load account");
          }
        }
      } catch (e: any) {
        if (ok) setErr(e?.message ?? "Failed to load account");
      } finally {
        if (ok) setLoading(false);
      }
    }

    run();
    return () => {
      ok = false;
    };
  }, [email]);

  /* ----------- Small building blocks ----------- */
  const Card: React.FC<{ title: string; value?: React.ReactNode; className?: string }> = ({
    title,
    value,
    className = "",
  }) => (
    <div className={`rounded-xl border bg-white/90 backdrop-blur p-4 shadow-sm ${className}`}>
      <div className="text-xs font-medium text-gray-500 tracking-wide">{title}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value ?? "—"}</div>
    </div>
  );

  const Skeleton = ({ lines = 1 }: { lines?: number }) => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-gray-200" />
      ))}
    </div>
  );

  const DisabledTile: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="text-left rounded-lg border bg-white/80 p-4 shadow-sm hover:bg-gray-50 disabled:opacity-60"
    >
      <div className="font-medium text-gray-900">{title}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </button>
  );

  /* ------------------- UI ------------------- */
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Title + Lead */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Your account overview and quick actions.</p>
      </header>

      {/* Alert for errors */}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Welcome + Stats */}
      <section aria-labelledby="overview" className="rounded-2xl bg-gradient-to-tr from-white to-gray-50 p-5 ring-1 ring-gray-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-gray-500">Welcome</div>
            {loading ? (
              <div className="mt-1 w-40">
                <Skeleton />
              </div>
            ) : (
              <div className="mt-0.5 text-xl font-semibold text-gray-900">
                {account?.name || "—"}
              </div>
            )}
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-2">
            <Card
              title="Account Number"
              value={loading ? <Skeleton /> : <span className="tabular-nums">{account?.accountNumber || "—"}</span>}
            />
            <Card
              title="Available Balance"
              value={loading ? <Skeleton /> : <span className="tabular-nums">{naira(account?.balance)}</span>}
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="qa-title" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="qa-title" className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Transfer (enabled) */}
          <a
            href="/transfer"
            className="block rounded-lg border bg-white/80 p-4 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="font-medium text-gray-900">Transfer</div>
            <div className="text-sm text-gray-600">Send money to banks &amp; wallets.</div>
          </a>

          {/* Others (disabled placeholders for now) */}
          <DisabledTile title="Buy Airtime" subtitle="Top up any network instantly." />
          <DisabledTile title="Pay Bills" subtitle="Utility, TV, internet, more." />
          <DisabledTile title="Loans" subtitle="Quick loans & offers." />
          <DisabledTile title="Virtual Cards" subtitle="Create & manage virtual cards." />
          <DisabledTile title="QR Payments" subtitle="Scan & pay at merchants." />
        </div>
      </section>
    </main>
  );
}
