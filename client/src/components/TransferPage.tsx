import { FormEvent, useState } from "react";
import { transfer } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function TransferPage() {
  const navigate = useNavigate();
  const [toAccount, setToAccount] = useState("");
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [pin, setPin] = useState("");
  const [description, setDescription] = useState("Transfer");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>({ ok: false, text: "" });

  const email = localStorage.getItem("ceebank.email") || "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg({ ok: false, text: "" });

    if (!email) {
      setMsg({ ok: false, text: "Please log in first." });
      navigate("/login");
      return;
    }
    if (!pin || pin.length !== 4) {
      setMsg({ ok: false, text: "Enter your 4-digit transaction PIN." });
      return;
    }
    if (!toAccount || !toName || !amount || amount <= 0) {
      setMsg({ ok: false, text: "Fill in all required fields." });
      return;
    }

    setBusy(true);
    try {
      const r = await transfer({
        email,
        pin,
        toAccount,
        toName,
        toEmail: toEmail || undefined,
        amount: Number(amount),
        description: description || undefined,
      });

      if (r.ok) {
        setMsg({ ok: true, text: `Transfer successful • Ref: ${r.reference}. New balance: ₦${Number(r.balance).toLocaleString()}` });
        // Optionally route home after a short delay
        // setTimeout(() => navigate("/"), 1200);
      } else {
        setMsg({ ok: false, text: r.error || "Transfer failed" });
      }
    } catch (_) {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "22px auto", padding: "0 16px" }}>
      <div className="card">
        <div className="h1" style={{ marginBottom: 12 }}>Transfer</div>
        <form onSubmit={onSubmit} className="grid" style={{ gap: 14 }}>
          <div>
            <div className="small">Recipient Account *</div>
            <input className="input" placeholder="e.g. GTB-22334455" value={toAccount} onChange={e => setToAccount(e.target.value)} />
          </div>

          <div>
            <div className="small">Recipient Name *</div>
            <input className="input" placeholder="e.g. Cynthia" value={toName} onChange={e => setToName(e.target.value)} />
          </div>

          <div>
            <div className="small">Recipient Email (optional)</div>
            <input className="input" placeholder="Email to receive receipt" value={toEmail} onChange={e => setToEmail(e.target.value)} />
          </div>

          <div>
            <div className="small">Amount (₦) *</div>
            <input className="input" type="number" min="1" step="1" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} />
          </div>

          <div>
            <div className="small">Description</div>
            <input className="input" placeholder="What's this for?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <div className="small">4-digit PIN *</div>
            <input className="input" type="password" inputMode="numeric" maxLength={4} placeholder="****" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0,4))} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <button className="button" type="submit" disabled={busy}>{busy ? "Processing…" : "Send Money"}</button>
            <span className="small">Funds will be debited instantly.</span>
          </div>

          {msg.text && (
            <div style={{
              marginTop: 6,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.08)",
              background: msg.ok ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)",
              color: msg.ok ? "#9af7b8" : "#f7b0b0"
            }}>
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
