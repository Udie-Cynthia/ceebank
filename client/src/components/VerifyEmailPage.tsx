// client/src/components/VerifyEmailPage.tsx
// Email verification screen (client-side). Reads ?email=... and allows "Resend email".
// Next step we will implement a real backend sender (Mailtrap) at POST /api/auth/send-verification.

import React from "react";
import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmailPage() {
  const q = useQuery();
  const email = q.get("email") || localStorage.getItem("email") || "";
  const name =
    localStorage.getItem("displayName") ||
    sessionStorage.getItem("displayName") ||
    "Cynthia";

  const [sending, setSending] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  async function resend() {
    setSending(true);
    setNote(null);
    try {
      // This will work as a MOCK until we add the real server endpoint next step.
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          // Where your CTA should point in a real app:
          verifyUrl: `${window.location.origin}/login`,
        }),
      });

      // If backend not ready yet, treat non-200 as mock success to keep the UX smooth.
      if (!res.ok) {
        setNote("A verification email has been (mock) sent to your inbox.");
        return;
      }
      const json = await res.json().catch(() => ({}));
      setNote(
        json?.message ||
          "A verification email has been sent to your inbox. Please check your email."
      );
    } catch (e: any) {
      setNote("A verification email has been (mock) sent to your inbox.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(40rem 40rem at 10% -10%, rgba(37,99,235,.06), transparent 60%), radial-gradient(40rem 40rem at 100% 0%, rgba(14,165,233,.06), transparent 60%)",
      }}
    >
      <section className="card" style={{ width: "100%", maxWidth: 680 }}>
        {/* Header banner */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #0ea5e9 55%, #22c55e 100%)",
            color: "white",
            padding: "22px 18px",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/ceebank-logo.svg"
              alt="CeeBank"
              style={{ height: 36, background: "white", borderRadius: 8, padding: 4 }}
            />
            <div>
              <h2 style={{ margin: 0 }}>Verify Your Email Address</h2>
              <p style={{ margin: "6px 0 0 0", opacity: 0.95 }}>
                Please check your inbox for the verification link.
              </p>
            </div>
          </div>
        </div>

        {/* Success notice */}
        <div
          className="card"
          style={{
            marginTop: 14,
            borderColor: "#86efac",
            background: "#f0fdf4",
            color: "#14532d",
          }}
        >
          <strong>Success</strong>
          <div style={{ marginTop: 6 }}>
            Your registration is successful, {name}. We’ve sent a verification link to{" "}
            <strong>{email || "your email"}</strong>. Click the link to verify your email.
          </div>
        </div>

        {/* Illustration */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 18 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "9999px",
              background: "#e0f2fe",
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              color: "#0284c7",
            }}
            aria-hidden
          >
            ✉️
          </div>
          <h3 style={{ marginBottom: 0 }}>Check your inbox</h3>
          <p className="text-muted" style={{ marginTop: 6 }}>
            We’ve sent you an email with a link to confirm your account.
          </p>
        </div>

        {/* Help list */}
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Didn’t get the email?</h3>
          <ol style={{ marginTop: 6, paddingLeft: 18 }}>
            <li>The email may be in your spam folder</li>
            <li>The email address you entered might have a typo</li>
            <li>You may have used a different email during signup</li>
          </ol>

          <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={resend} disabled={sending}>
              {sending ? "Resending…" : "Resend verification email"}
            </button>
            <Link to="/login" className="btn-outline">
              Back to Sign In
            </Link>
          </div>

          {note && (
            <p style={{ margin: "10px 0 0 0", color: "#14532d" }}>
              {note}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
