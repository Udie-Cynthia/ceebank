// src/components/Register.tsx
// Simple, polished registration form that calls /api/auth/register
// Shows a success state when the Welcome/Verification email is sent.

import React, { useState } from "react";

type ApiResponse = {
  ok?: boolean;
  message?: string;
  user?: { id: string; email: string; name: string; accountNumber: string };
  welcome?: { sent: boolean; messageId?: string; error?: string };
  verify?: { sent: boolean; messageId?: string; error?: string };
  error?: string;
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<ApiResponse | null>(null);

  const apiBase =
    (import.meta as any).env?.VITE_API_BASE ||
    (window as any).__API_BASE__ ||
    ""; // relative to same origin via Nginx proxy

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    setSuccess(null);

    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include verifyUrl so users also get a verification link
        body: JSON.stringify({
          email,
          password,
          name,
          verifyUrl: "https://ceebank.online/login",
        }),
      });

      const json = (await res.json()) as ApiResponse;

      if (!res.ok || json.ok === false) {
        throw new Error(json.error || json.message || "Registration failed");
      }

      // Store a friendly display name for Home greeting
      const displayName =
        name?.trim() ||
        (email.split("@")[0] || "Customer").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("email", email);

      setSuccess(json);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    const sentWelcome = success.welcome?.sent !== false;
    const alsoVerify = success.verify ? success.verify.sent !== false : false;
    const acct = success.user?.accountNumber;

    return (
      <div className="min-h-[70vh] grid place-items-center bg-sky-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
          <div className="text-center mb-4">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full grid place-items-center bg-sky-100">
              <span className="text-sky-700 font-bold">CB</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Registration successful</h2>
            <p className="text-slate-600 mt-1">
              {sentWelcome
                ? "A welcome email has been sent to your inbox."
                : "Registration complete."}
            </p>
            {alsoVerify && (
              <p className="text-slate-600">
                We’ve also sent a verification link. Please check your email.
              </p>
            )}
            {acct && (
              <p className="mt-2 text-slate-700">
                Your new account number: <span className="font-semibold">{acct}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <a
              href="/login"
              className="inline-flex w-full justify-center rounded-xl px-4 py-2.5 bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
            >
              Go to Login
            </a>
            <a
              href="/"
              className="inline-flex w-full justify-center rounded-xl px-4 py-2.5 bg-white border border-slate-200 text-slate-800 font-medium hover:bg-slate-50 transition"
            >
              Back to Home
            </a>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            © 2025 CeeBank. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-sky-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full grid place-items-center bg-sky-100">
            <span className="text-sky-700 font-bold">CB</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Create your CeeBank account</h2>
          <p className="text-slate-600">Join thousands enjoying modern digital banking.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g., Cynthia Udie"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="you@ceebank.online"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Choose a strong password"
              autoComplete="new-password"
            />
          </div>

          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl px-4 py-2.5 bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 transition"
          >
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <a className="text-sky-700 font-medium hover:underline" href="/login">
            Sign in
          </a>
        </p>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 CeeBank. All rights reserved.
        </p>
      </div>
    </div>
  );
}
