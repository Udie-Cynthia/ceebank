import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok || j.ok === false) {
        setErr(j.error || `Login failed: HTTP ${r.status}`);
        return;
      }

      // Persist email so Dashboard can fetch /api/auth/account
      (stay ? localStorage : sessionStorage).setItem("ceebank.email", email);

      // (Optional) persist tokens if your server returns them
      if (j.accessToken) (stay ? localStorage : sessionStorage).setItem("ceebank.at", j.accessToken);

      navigate("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Sign In</h1>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email Address</label>
          <input
            className="w-full rounded-lg border border-gray-300 p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@email.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full rounded-lg border border-gray-300 p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* tighter checkbox + label */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={stay}
            onChange={() => setStay((v) => !v)}
          />
          <span>Stay signed in for 30 days</span>
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white py-2 font-medium"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-gray-600">
          Not enrolled? <Link to="/register" className="text-sky-700 hover:underline">Create Account</Link>
        </p>

        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}

