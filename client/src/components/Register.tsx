import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * Create Account (Signup)
 * - Fields: name, email, password, 4-digit pin
 * - Tight checkbox for "Stay signed in for 30 days" and ToS/Privacy text
 * - Calls POST /api/auth/register, then POST /api/auth/login
 * - Stores profile + tokens, then redirects to /dashboard
 * - Clean, professional UI (no fancy colors/animations)
 */

type ApiUser = {
  email: string;
  name: string;
  accountNumber?: string;
  balance?: number;
};

type RegisterResp =
  | { ok: true; message?: string; user: ApiUser }
  | { ok: false; error: string };

type LoginResp =
  | {
      ok: true;
      user: ApiUser;
      accessToken?: string;
      refreshToken?: string;
    }
  | { ok: false; error: string };

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const apiBase = ""; // same-origin; Nginx proxies /api/* to the server

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Basic client validation
    if (!name.trim() || !email.trim() || !password.trim() || !/^\d{4}$/.test(pin)) {
      setError("Please fill all fields. PIN must be 4 digits.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Register
      const r1 = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, pin }),
      });
      const data1 = (await r1.json()) as RegisterResp;

      if (!r1.ok || !("ok" in data1) || !data1.ok) {
        const msg = (data1 as any)?.error || `Registration failed (HTTP ${r1.status})`;
        setError(msg);
        setSubmitting(false);
        return;
      }

      // Store profile (use server balance if present, otherwise default 4,000,000)
      const profile: ApiUser = {
        email: data1.user.email,
        name: data1.user.name,
        accountNumber: data1.user.accountNumber,
        balance:
          typeof data1.user.balance === "number" ? data1.user.balance : 4_000_000,
      };

      // Persist user profile immediately so Dashboard/Home can render without delay
      localStorage.setItem("ceebank:user", JSON.stringify(profile));

      setSuccessMsg("Account created successfully.");

      // 2) Auto-login (optional but improves UX)
      try {
        const r2 = await fetch(`${apiBase}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile.email, password }),
        });
        const data2 = (await r2.json()) as LoginResp;

        if (r2.ok && data2.ok) {
          // Prefer server values if returned
          const merged: ApiUser = {
            email: data2.user.email,
            name: data2.user.name,
            accountNumber: data2.user.accountNumber || profile.accountNumber,
            balance:
              typeof data2.user.balance === "number"
                ? data2.user.balance
                : profile.balance,
          };
          localStorage.setItem("ceebank:user", JSON.stringify(merged));

          if (data2.accessToken || data2.refreshToken) {
            localStorage.setItem(
              "ceebank:auth",
              JSON.stringify({
                accessToken: data2.accessToken,
                refreshToken: data2.refreshToken,
                staySignedIn,
              })
            );
          }
        }
      } catch {
        // If login fails silently, we still continue to dashboard with the saved profile.
      }

      // 3) Redirect
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("A network or server error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Open an account to access transfers, bill payments, cards, and more.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cynthia Ud..."
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a secure password"
          />
        </div>

        {/* PIN */}
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-800">
            4-Digit PIN
          </label>
          <input
            id="pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
            placeholder="••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            You’ll use this PIN to authorize transfers.
          </p>
        </div>

        {/* Stay signed in (tight) */}
        <div className="flex items-start gap-2">
          <input
            id="stay"
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="stay" className="text-sm text-gray-700 select-none">
            Stay signed in for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>

        {/* Terms (tight) */}
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-blue-700 hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-blue-700 hover:underline">Privacy Policy</a>.
        </p>

        {/* Sign-in link */}
        <p className="text-sm text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
