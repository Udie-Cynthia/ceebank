// client/src/pages/RegisterPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [staySignedIn, setStaySignedIn] = React.useState(true);
  const [agree, setAgree] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!agree) return "You must agree to the Terms and Privacy Policy.";
    return null;
    }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setMsg(v);
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      // 1) Register
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!r.ok) throw new Error(`Register HTTP ${r.status}`);
      await r.json();

      // 2) Login immediately
      const l = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!l.ok) throw new Error(`Login HTTP ${l.status}`);
      const auth = await l.json();

      // 3) Persist tokens
      const storage = staySignedIn ? localStorage : sessionStorage;
      storage.setItem("accessToken", auth.accessToken || "");
      storage.setItem("refreshToken", auth.refreshToken || "");

      // 4) Store display name + email locally for greetings
      const displayName =
        (name || email.split("@")[0] || "Customer").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("email", email);

      // 5) Fetch account profile to show balance right away
      try {
        const acc = await fetch(`/api/auth/account?email=${encodeURIComponent(email)}`);
        if (acc.ok) {
          const data = await acc.json();
          if (data?.accountNumber) {
            localStorage.setItem("accountNumber", data.accountNumber);
          }
          if (Number.isFinite(data?.balance)) {
            localStorage.setItem("balance", String(data.balance));
          }
        }
      } catch { /* non-fatal */ }

      setMsg("Account created successfully.");
      // If you later add a /verify-email route, change this to /verify-email?email=...
      nav("/dashboard", { replace: true });
      setTimeout(() => (window.location.href = "/dashboard"), 250);
    } catch (err: any) {
      setMsg(err?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-gray-50">
      <section className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200">
          <div className="px-6 pt-6 pb-2 text-center">
            <img src="/ceebank-logo.svg" alt="CeeBank" className="h-10 mx-auto" />
            <h1 className="text-xl font-semibold mt-3">Create your CeeBank account</h1>
            <p className="text-sm text-gray-600 mt-1">
              Open an account in minutes and start transacting securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cynthia Udie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Tight, aligned checkboxes */}
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
              />
              <span>Stay signed in for 30 days</span>
            </label>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                By creating an account, you agree to our{" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>.
              </span>
            </label>

            {msg && (
              <div
                className={`text-sm ${
                  msg.toLowerCase().includes("failed") ? "text-red-600" : "text-green-600"
                }`}
              >
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
