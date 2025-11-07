import React, { useMemo, useState } from "react";
import { useAuth } from "../state/AuthContext"; // must already exist from Home/Dashboard usage
import { formatCurrency } from "../utils/format"; // simple helper like: new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN"}).format(x)

type RecentTxn = {
  when: string;            // ISO
  toName: string;
  toAccount: string;
  amount: number;
  reference: string;
  description?: string;
};

export default function TransferPage() {
  const { user, setUser } = useAuth(); // user: { email, name, accountNumber, balance }
  const [toName, setToName] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentTxn[]>([]);

  const canSubmit = useMemo(() => {
    return (
      !!user?.email &&
      !!toName.trim() &&
      !!toAccount.trim() &&
      typeof amount === "number" &&
      amount > 0 &&
      pin.trim().length === 4 && /^\d{4}$/.test(pin.trim())
    );
  }, [user?.email, toName, toAccount, amount, pin]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) {
      setError("You must be signed in to make a transfer.");
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,          // sender email from session
          pin: pin.trim(),            // 4-digit PIN
          toAccount: toAccount.trim(),
          toName: toName.trim(),
          amount: Number(amount),
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      // Backend returns: { ok: true, reference, balance, message }
      const newBalance: number | undefined = data?.balance;
      const reference: string = data?.reference;

      if (typeof newBalance === "number") {
        // Update balance immediately in global auth state
        setUser((prev) => (prev ? { ...prev, balance: newBalance } : prev));
      }

      // Push to recent transfers list (UI-only history)
      setRecent((prev) => [
        {
          when: new Date().toISOString(),
          toName: toName.trim(),
          toAccount: toAccount.trim(),
          amount: Number(amount),
          description: description.trim() || undefined,
          reference,
        },
        ...prev,
      ]);

      // Clear form (keep description optional)
      setToName("");
      setToAccount("");
      setAmount("");
      setDescription("");
      setPin("");
      setSuccess(`Transfer successful · Ref: ${reference}`);
    } catch (err: any) {
      setError(err?.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      {/* Page title */}
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Transfer</h1>
      <p style={{ marginTop: 6, color: "#5a5f6a" }}>
        Send money to banks &amp; wallets. Your balance updates immediately after a successful transfer.
      </p>

      {/* Sender summary */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <InfoCard label="Sender" value={user?.name || "—"} />
        <InfoCard label="Account Number" value={user?.accountNumber || "—"} mono />
        <InfoCard
          label="Available Balance"
          value={
            typeof user?.balance === "number" ? formatCurrency(user.balance, "NGN") : "—"
          }
          strong
        />
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: "10px 12px",
            border: "1px solid #f4c7c7",
            background: "#fff6f6",
            color: "#a12626",
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: "10px 12px",
            border: "1px solid #c7e7cf",
            background: "#f6fffa",
            color: "#176c3a",
            borderRadius: 8,
          }}
        >
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "1fr",
          }}
        >
          <Field
            label="Recipient Name"
            required
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="e.g., Cynthia Udie"
          />
          <Field
            label="Recipient Account"
            required
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="e.g., GTB-22334455"
          />
          <Field
            label="Amount (₦)"
            required
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              setAmount(v === "" ? "" : Number(v));
            }}
            placeholder="e.g., 5000"
          />
          <Field
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., School fees"
          />
          <Field
            label="PIN"
            required
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(clean);
            }}
            placeholder="4-digit PIN"
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #1e4a8a",
                background: submitting ? "#2a64bd" : "#275db0",
                color: "#fff",
                fontWeight: 600,
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              }}
              aria-busy={submitting}
            >
              {submitting ? "Processing…" : "Send Money"}
            </button>
            <p style={{ margin: 0, color: "#6a707c" }}>
              Emails are sent automatically by the server after a successful transfer.
            </p>
          </div>
        </div>
      </form>

      {/* Recent transfers */}
      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent transfers</h2>
        {recent.length === 0 ? (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              padding: "14px 12px",
              borderRadius: 10,
              color: "#6a707c",
              background: "#fafbfc",
            }}
          >
            No transfers yet in this session.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {recent.map((t) => (
              <TxnRow key={t.reference} txn={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ——— Small UI primitives ——— */

function InfoCard(props: { label: string; value: React.ReactNode; mono?: boolean; strong?: boolean }) {
  const { label, value, mono, strong } = props;
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: 12,
        padding: "14px 12px",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 0.3, color: "#6a707c" }}>{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: strong ? 22 : 16,
          fontWeight: strong ? 700 : 600,
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    required?: boolean;
  }
) {
  const { label, required, ...rest } = props;
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {label} {required && <span style={{ color: "#b91c1c" }}>*</span>}
      </span>
      <input
        {...rest}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          outline: "none",
        }}
      />
    </label>
  );
}

function TxnRow({ txn }: { txn: RecentTxn }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: 12,
        padding: "12px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{txn.toName}</div>
        <div style={{ color: "#6a707c", fontSize: 12 }}>
          {txn.toAccount} · {new Date(txn.when).toLocaleString()}
        </div>
        {txn.description && (
          <div style={{ color: "#394150", marginTop: 4, fontSize: 13 }}>{txn.description}</div>
        )}
        <div style={{ color: "#6a707c", marginTop: 4, fontSize: 12 }}>Ref: {txn.reference}</div>
      </div>
      <div style={{ fontWeight: 800 }}>{formatCurrency(txn.amount, "NGN")}</div>
    </div>
  );
}
