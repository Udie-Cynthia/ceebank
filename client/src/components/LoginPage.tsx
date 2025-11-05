import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNote(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      // Persist session basics
      localStorage.setItem("email", email);
      if (staySignedIn) {
        localStorage.setItem("staySignedIn", "1");
      } else {
        localStorage.removeItem("staySignedIn");
      }

      setNote("Login successful. Redirecting…");
      navigate("/dashboard");
    } catch (err: any) {
      setNote(`Login failed: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold">CeeBank</div>
          <div className="text-sm text-gray-600">Secure sign in</div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-2 text-right">
              <Link to="/forgot" className="text-sm text-gray-700 underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Stay signed in (tight checkbox + label) */}
          <label className="mt-1 inline-flex items-center gap-2 select-none text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4 align-middle"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <span>Stay signed in for 30 days</span>
          </label>

          {/* Terms line (kept tight to checkbox) */}
          <p className="-mt-1 text-xs text-gray-600">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-2xl bg-black px-5 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {note && (
            <div
              className={`text-sm ${
                note.startsWith("Login successful")
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {note}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          New to CeeBank?{" "}
          <Link to="/register" className="underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
