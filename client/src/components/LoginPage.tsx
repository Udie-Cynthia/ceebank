import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (r.ok && data?.ok) {
        localStorage.setItem("ceebank_email", email);
        if (!keep) sessionStorage.setItem("ceebank_email", email);
        nav("/dashboard");
      } else {
        setError(data?.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7FAFC] text-slate-800 grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-sky-600"
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
          />
          <span>Stay signed in for 30 days</span>
        </label>

        {error && <p className="text-rose-600">{error}</p>}

        <button
          disabled={busy}
          className="w-full rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60 px-4 py-2 font-medium"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-slate-600">
          New here? <Link to="/register" className="text-sky-600 hover:underline">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
