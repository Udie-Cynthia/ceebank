import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || "";

type RegisterResponse =
  | {
      ok: true;
      message?: string;
      user: { email: string; name: string; accountNumber: string };
    }
  | { ok: false; error: string };

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function validPin(p: string) {
    return /^\d{4}$/.test(p);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (!validPin(pin)) {
      setErr("PIN must be exactly 4 digits.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          pin: pin.trim(),
        }),
      });

      if (!r.ok) {
        let msg = `HTTP ${r.status}`;
        try {
          const j = (await r.json()) as RegisterResponse;
          if ("ok" in j && j.ok === false && j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        setErr(`Registration failed: ${msg}`);
        return;
      }

      const data = (await r.json()) as RegisterResponse;
      if ("ok" in data && data.ok) {
        setInfo(data.message || "Account created.");
        // optional: auto-login flow in future; for now, forward to login
        setTimeout(() => nav("/login"), 600);
      } else {
        setErr((data as any).error || "Registration failed");
      }
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-gray-600 mt-1">Banking that just works—fast, secure, modern.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
          <label className="block text-sm font-medium">Create password</label>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Transaction PIN (4 digits)</label>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder="1234"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You’ll use this code to authorize transfers and payments.
          </p>
        </div>

        {/* Tight checkbox + legal text */}
        <div className="mt-1 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-black align-middle"
              checked={stay}
              onChange={(e) => setStay(e.target.checked)}
            />
            <span className="leading-none">Stay signed in for 30 days</span>
          </label>

          <p className="text-xs text-gray-500 leading-snug">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
        {info && <div className="text-sm text-green-600">{info}</div>}

        <button
          className="w-full rounded-lg bg-black text-white p-2 font-medium disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
