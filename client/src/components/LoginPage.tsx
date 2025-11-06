import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || "";

type LoginResponse =
  | {
      ok: true;
      user: { email: string; name: string; accountNumber: string };
      accessToken: string;
      refreshToken: string;
    }
  | { ok: false; error: string };

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!r.ok) {
        // Typical backend sends 401 with a JSON { ok:false, error:"..." }
        let msg = `HTTP ${r.status}`;
        try {
          const j = (await r.json()) as LoginResponse;
          if ("ok" in j && j.ok === false && j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        setErr(`Login failed: ${msg}`);
        return;
      }

      const data = (await r.json()) as LoginResponse;
      if ("ok" in data && data.ok) {
        // if you later wire real tokens, store them when stay==true
        if (stay) {
          localStorage.setItem("ceebank_user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("ceebank_user", JSON.stringify(data.user));
        }
        nav("/");
      } else {
        setErr((data as any).error || "Login failed");
      }
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="text-sm text-gray-600 mt-1">Sign in to your CeeBank account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Tighter checkbox row */}
        <div className="mt-1 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-black align-middle"
              checked={stay}
              onChange={(e) => setStay(e.target.checked)}
            />
            <span className="leading-none">Stay signed in for 30 days</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          className="w-full rounded-lg bg-black text-white p-2 font-medium disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-sm text-center">
          New here?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
