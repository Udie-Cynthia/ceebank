// client/src/App.tsx
// App shell: guarded routes, styled Login, HomePage, DashboardLive,
// richer About, Switch Account, and NEW /register route + link.

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import ApiInfo from "./components/ApiInfo";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./components/HomePage";
import DashboardLive from "./components/DashboardLive";
import RegisterPage from "./components/RegisterPage"; // NEW
import VerifyEmailPage from "./components/VerifyEmailPage";
import Register from "./components/Register";s

/* ---------- Nav styles ---------- */
const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "12px 20px",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#0f172a",
  padding: "6px 10px",
  borderRadius: 8,
};

const activeStyle: React.CSSProperties = { background: "#e2e8f0" };

/* ---------- Navbar ---------- */
function Navbar() {
  const nav = useNavigate();
  const [authed, setAuthed] = React.useState(
    !!(
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken")
    )
  );

  React.useEffect(() => {
    const i = setInterval(
      () =>
        setAuthed(
          !!(
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("accessToken")
          )
        ),
      600
    );
    return () => clearInterval(i);
  }, []);

  const onLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("displayName");
    localStorage.removeItem("email");
    setAuthed(false);
    nav("/login", { replace: true });
  };

  return (
    <nav style={navStyle}>
      <a
        href="/"
        className="logo"
        aria-label="CeeBank Home"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <img src="/ceebank-logo.svg" alt="CeeBank" width={160} height={40} />
      </a>

      <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
        {authed && (
          <>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
             <a href="/register" className="hover:text-sky-700">Open account</a> 
              Dashboard
            </NavLink>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
              Home
            </NavLink>
            <NavLink
              to="/login"
              title="Go to login to switch account"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
              Switch Account
            </NavLink>
          </>
        )}

        {!authed && (
          <>
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
              Create Account
            </NavLink>
          </>
        )}

        <NavLink
          to="/about"
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          About
        </NavLink>
      </div>

      <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 14 }}>
        © 2025
      </span>

      {authed && (
        <button className="btn-danger" onClick={onLogout} style={{ marginLeft: 12 }}>
          Logout
        </button>
      )}
    </nav>
  );
}

/* ---------- Page wrapper ---------- */
function Page({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: 1024,
        margin: "0 auto",
        fontFamily: "system-ui, Segoe UI, Inter, Arial, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
    </main>
  );
}

/* ---------- About ---------- */
function AboutPage() {
  return (
    <Page title="About CeeBank">
      <p style={{ lineHeight: 1.7 }}>
        <strong>CeeBank</strong> is a modern online banking demo founded by{" "}
        <strong>Cynthia Udie</strong> — DevOps & Cloud Security Engineer and Web
        Developer — showcasing clean architecture, secure patterns, containerization,
        CI/CD, and AWS deployment best practices.
      </p>

      <div className="card" style={{ margin: "12px 0", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Highlights</h3>
        <ul style={{ lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
          <li>Custom domain <code>ceebank.online</code> with HTTPS (Certbot/Let’s Encrypt)</li>
          <li>Frontend: React (Vite) with clean, modern FinTech styling</li>
          <li>Backend: Node.js + Express with JWT-ready structure</li>
          <li>Containerized: Docker images built & pushed via GitHub Actions</li>
          <li>Deployed: Nginx reverse proxy on AWS EC2 (ECS-ready)</li>
        </ul>
      </div>

      <div className="card" style={{ margin: "12px 0", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>About Cynthia</h3>
        <p style={{ marginTop: 6 }}>
          Cynthia builds secure, scalable cloud workloads and streamlines delivery with
          CI/CD. This project demonstrates full-stack craftsmanship — from resilient API
          design and frontend polish to container builds and automated deployments.
        </p>
        <p style={{ marginTop: 6 }}>
          <strong>Profiles & Contact:</strong> LinkedIn:{" "}
          <a
            href="https://linkedin.com/in/cynthia-udie-68936135b"
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/cynthia-udie-68936135b
          </a>{" "}
          • Email: <a href="mailto:udiecynthia@gmail.com">udiecynthia@gmail.com</a>
        </p>
      </div>

      <p className="text-muted" style={{ marginTop: 12 }}>
        © All Rights Reserved – 2025
      </p>

      <ApiInfo />
    </Page>
  );
}

/* ---------- Login (styled, now shows Create Account link) ---------- */
function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [staySignedIn, setStaySignedIn] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  const apiBase =
    (import.meta as any).env?.VITE_API_BASE ||
    (window as any).__API_BASE__ ||
    "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setBusy(true);

    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || "Unable to sign in. Please try again."
        );
      }

      // Save tokens and a display name for greeting
      const displayName =
        (email.split("@")[0] || "Customer").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("email", email);

      // Tokens (mock or real)
      if (json?.accessToken) {
        if (staySignedIn) {
          localStorage.setItem("accessToken", json.accessToken);
          json.refreshToken && localStorage.setItem("refreshToken", json.refreshToken);
        } else {
          sessionStorage.setItem("accessToken", json.accessToken);
          json.refreshToken && sessionStorage.setItem("refreshToken", json.refreshToken);
        }
      }

      setOkMsg("Sign-in successful. Redirecting to your dashboard…");
      // Small delay so the success message is visible
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <section className="min-h-[70vh] grid place-items-center bg-sky-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
          {/* Brand */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full grid place-items-center bg-sky-100">
              <span className="text-sky-700 font-bold">CB</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-slate-600">Sign in to access your CeeBank account.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
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
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            {/* Preferences + Terms (tight alignment) */}
            <div className="mt-1.5 space-y-3">
              {/* Stay signed in */}
              <label className="flex items-start gap-2 select-none">
                <input
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                />
                <span className="text-sm text-slate-700 leading-5">
                  <span className="font-medium">Stay signed in for 30 days</span>
                </span>
              </label>

              {/* Terms line, compact */}
              <p className="text-xs leading-5 text-slate-500">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-sky-700 hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-sky-700 hover:underline">Privacy Policy</a>.
              </p>
            </div>

            {err && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                {err}
              </div>
            )}
            {okMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">
                {okMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl px-4 py-2.5 bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm">
            <a href="/forgot" className="text-sky-700 hover:underline">Forgot password?</a>
            <span className="text-slate-500">or</span>
            <a href="/register" className="text-sky-700 hover:underline">Open an account</a>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            © 2025 CeeBank. All rights reserved.
          </p>
        </div>
      </section>
    </Page>
  );
}

/* ---------- App ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* NEW */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLive />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route path="/register" element={<Register />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
