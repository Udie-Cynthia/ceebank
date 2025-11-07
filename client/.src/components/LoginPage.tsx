import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LoginPage
 * - Calls live API: https://ceebank.online/api/auth/login
 * - Persists tokens based on "Stay signed in for 30 days"
 * - Redirects to Home (/) on success
 * - Tight checkbox + label spacing; professional, simple UI
 */

const API_BASE = "https://ceebank.online";

type LoginResponse =
  | {
      ok: true;
      user: { email: string; name: string; accountNumber?: string };
      accessToken: string;
      refreshToken: string;
    }
  | { ok: false; error: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [staySignedIn, setStaySignedIn] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const storage = staySignedIn ? window.localStorage : window.sessionStorage;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json: LoginResponse = await res.json().catch(() => ({
        ok: false as const,
        error: "Unexpected response",
      }));

      if (!res.ok || !("ok" in json) || json.ok !== true) {
        const serverError =
          (json as any)?.error ||
          (res.status === 401
            ? "Invalid email or password"
            : `Login failed (HTTP ${res.status})`);
        setErrorMsg(serverError);
        return;
      }

      // Persist session
      storage.setItem("cb_accessToken", json.accessToken);
      storage.setItem("cb_refreshToken", json.refreshToken);
      storage.setItem(
        "cb_user",
        JSON.stringify({
          email: json.user.email,
          name: json.user.name,
          accountNumber: json.user.accountNumber,
        })
      );

      // Optional: clear the other storage to avoid confusion when toggling the checkbox
      (staySignedIn ? window.sessionStorage : window.localStorage).removeItem(
        "cb_accessToken"
      );
      (staySignedIn ? window.sessionStorage : window.localStorage).removeItem(
        "cb_refreshToken"
      );
      (staySignedIn ? window.sessionStorage : window.localStorage).removeItem(
        "cb_user"
      );

      // Go Home
      navigate("/");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        background: "#ffffff",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Sign In</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Email Address
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            outline: "none",
          }}
        />

        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            outline: "none",
          }}
        />

        {/* Tight checkbox + text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8, // keep this small for tightness
            marginTop: 12,
          }}
        >
          <input
            id="staySignedIn"
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            style={{ margin: 0, width: 16, height: 16 }}
          />
          <label htmlFor="staySignedIn" style={{ userSelect: "none" }}>
            Stay signed in for 30 days
          </label>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              color: "#b42318",
              background: "#fee4e2",
              border: "1px solid #fecdca",
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#0a5cff",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span>Not enrolled?</span>
          <a href="/register" style={{ color: "#0a5cff", textDecoration: "none" }}>
            Create Account
          </a>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: "#667085" }}>
          By signing in, you agree to our{" "}
          <a href="/terms" style={{ color: "#0a5cff", textDecoration: "none" }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: "#0a5cff", textDecoration: "none" }}>
            Privacy Policy
          </a>
          .
        </div>
      </form>
    </div>
  );
}
