import { useEffect, useState } from "react";
import { getAccount } from "../lib/api";

type Account = {
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export default function Home() {
  const [email, setEmail] = useState<string>(() => localStorage.getItem("ceebank.email") || "");
  const [acct, setAcct] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(!!email);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function run() {
      if (!email) return;
      setLoading(true);
      setError("");
      try {
        const r = await getAccount(email);
        if (!r.ok) { setError("Could not load account"); setAcct(null); }
        else {
          setAcct({ email: r.email, name: r.name, accountNumber: r.accountNumber, balance: r.balance });
        }
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [email]);

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: "0 16px" }}>
      <div className="grid grid-3">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="h1">Welcome{acct?.name ? `, ${acct.name}` : ""}</div>
          <div className="muted" style={{ marginBottom: 14 }}>
            {acct?.accountNumber
              ? <>Your CeeBank account number is <b>{acct.accountNumber}</b>.</>
              : <>Sign in to view your account.</>}
          </div>

          <div className="balance">
            {loading ? "…" : (acct ? `₦${acct.balance.toLocaleString()}` : "₦0")}
          </div>
          <div className="kpi">Current Balance</div>
        </div>

        <div className="card">
          <div className="h2">Profile</div>
          <div className="small">Email</div>
          <div style={{ marginBottom: 8 }}>{acct?.email || (email || "—")}</div>
          <div className="small">Name</div>
          <div>{acct?.name || "—"}</div>
        </div>
      </div>
    </div>
  );
}
