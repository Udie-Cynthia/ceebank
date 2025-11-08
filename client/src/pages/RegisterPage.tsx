// client/src/components/RegisterPage.tsx
// CeeBank account creation (mock): name, email, phone, country, password, confirm,
// stay signed in, terms consent. On success, auto-login (mock) and redirect.

import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

type Country = { code: string; name: string; dial: string };

const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "DE", name: "Germany", dial: "+49" },
];

export default function RegisterPage() {
  const nav = useNavigate();
  const location = useLocation() as any;

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [country, setCountry] = React.useState<Country>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [staySignedIn, setStaySignedIn] = React.useState(true);
  const [agree, setAgree] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const phoneE164 = `${country.dial}${phoneLocal.replace(/\D/g, "")}`;

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!agree) return "You must agree to the Terms and Privacy Policy.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      // 1) Create account (mock API)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phoneE164,
          country: country.code,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reg = await res.json();

      // 2) Auto-login (mock) like a real bank would
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) throw new Error(`Login HTTP ${loginRes.status}`);
      const json = await loginRes.json();

      // 3) Persist tokens (mock)
      if (staySignedIn) {
        localStorage.setItem("accessToken", json.accessToken);
        localStorage.setItem("refreshToken", json.refreshToken);
      } else {
        sessionStorage.setItem("accessToken", json.accessToken);
        sessionStorage.setItem("refreshToken", json.refreshToken);
      }

      // Save display name for greetings
      const displayName = (name || email.split("@")[0] || "Cynthia")
        .replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("email", email);

      // 4) Redirect to Verify Email page (pass email in query)
      const to = `/verify-email?email=${encodeURIComponent(email)}`;
nav(to, { replace: true });
// hard fallback in case SPA nav is interrupted
setTimeout(() => (window.location.href = to), 300);
setMessage("Account created! Redirecting to email verification…");
    } catch (e: any) {
      setMessage(`Registration failed: ${e.message ?? e}`);
    } finally {
      setLoading(false);
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
      <section className="card" style={{ width: "100%", maxWidth: 560 }}>
        {/* Header with logo + bank name */}
        <div style={{ display: "grid", placeItems: "center", textAlign: "center", marginBottom: 12 }}>
          <img src="/ceebank-logo.svg" alt="CeeBank" style={{ height: 48 }} />
          <h2 style={{ margin: "12px 0 4px 0" }}>Create your CeeBank account</h2>
          <p className="text-muted" style={{ margin: 0 }}>
            Open a demo account in seconds — then start transferring instantly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <label className="grid">
            <span className="kicker">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cynthia Udie"
              required
            />
          </label>

          <label className="grid">
            <span className="kicker">Email Address</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@email.com"
              required
              autoComplete="email"
            />
          </label>

          {/* Phone + Country */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="grid">
              <span className="kicker">Phone Number</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={country.dial}
                  readOnly
                  style={{ width: 90 }}
                  aria-label="Country code"
                />
                <input
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  placeholder="8012345678"
                  inputMode="tel"
                  autoComplete="tel-national"
                  aria-label="Local phone number"
                />
              </div>
            </label>

            <label className="grid">
              <span className="kicker">Country</span>
              <select
                value={country.code}
                onChange={(e) => {
                  const next = COUNTRIES.find((c) => c.code === e.target.value)!;
                  setCountry(next);
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Passwords */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="grid">
              <span className="kicker">Password</span>
              <div style={{ position: "relative" }}>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    border: "1px solid var(--border)",
                    background: "#fff",
                    color: "#334155",
                    borderRadius: 8,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="grid">
              <span className="kicker">Confirm Password</span>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
            </label>
          </div>

          {/* Stay signed in */}
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <span className="text-muted">Stay signed in for 30 days</span>
          </label>

          {/* Terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              aria-describedby="terms"
            />
            <span id="terms" className="text-muted">
              By creating an account, you agree to our{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
            </span>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>

          {message && (
            <p
              style={{
                margin: 0,
                color: message.startsWith("Account created") ? "#16a34a" : "#dc2626",
              }}
            >
              {message}
            </p>
          )}
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span className="text-muted">Already have an account?</span>{" "}
          <Link to="/login">Sign In</Link>
        </div>
      </section>
    </main>
  );
}
