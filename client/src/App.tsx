// client/src/App.tsx
// Clean, login-first app with guarded routes, solid redirect after login,
// persistent tokens, Home greeting + deterministic 10-digit account number.

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Existing components in your repo:
import ApiInfo from "./components/ApiInfo";
import RequireAuth from "./components/RequireAuth";
import HomeTiles from "./components/HomeTiles";
import DashboardLive from "./components/DashboardLive";
// Optional tiny visual debug (shows Auth: ON/OFF). If you created it earlier, keep.
// If you don't have it, you may delete the import and <TokenLamp /> line below.
// import TokenLamp from "./components/TokenLamp";

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

function Navbar() {
  const nav = useNavigate();
  const [authed, setAuthed] = React.useState(
    !!(
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken")
    )
  );

  // keep button state in sync with storage changes
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
        style={{ display: "inline-flex", alignItems: "center" }}
        aria-label="CeeBank Home"
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

        {!authed && (
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            Login
          </NavLink>
        )}
      </div>

      <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 14 }}>
        © 2025
      </span>

      {authed && (
        <button
          onClick={onLogout}
          style={{
            marginLeft: 12,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ef4444",
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

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
        fontFamily: "system-ui, Segoe UI, Inter, Arial, sans-serif",
        padding: "2rem",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
    </main>
  );
}

function AboutPage() {
  return (
    <Page title="About CeeBank">
      <p style={{ lineHeight: 1.7 }}>
        CeeBank is a modern online banking demo founded by{" "}
        <strong>Cynthia Udie</strong> (DevOps, Cloud Security Engineer, and Web
        Developer). It showcases full-stack development, containerization,
        CI/CD, and AWS deployment.
      </p>
      <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
        <li>
          Custom domain: <code>ceebank.online</code> with HTTPS
        </li>
        <li>Frontend: React (Vite) • Backend: Node.js + Express</li>
        <li>Deployment: Docker, GitHub Actions, AWS EC2/ECS</li>
      </ul>
      <p>
        Contact: <a href="mailto:udiecynthia@gmail.com">udiecynthia@gmail.com</a>{" "}
        • LinkedIn: linkedin.com/in/cynthia-udie-68936135b
      </p>
    </Page>
  );
}

function HomePage() {
  // Name comes from login; default to "Cynthia"
  const name =
    (typeof window !== "undefined" &&
      (localStorage.getItem("displayName") ||
        sessionStorage.getItem("displayName"))) ||
    "Cynthia";

  // Deterministic 10-digit account number derived from email
  let acct = "0123456789";
  if (typeof window !== "undefined") {
    const email = localStorage.getItem("email") || "cynthia@example.com";
    let h = 0;
    for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
    acct = (h % 1_000_000_0000).toString().padStart(10, "0");
  }

  return (
    <Page title={`Hello ${name}, welcome back`}>
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          marginBottom: 16,
        }}
      >
        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 6 }}>
          Account Number
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>
          {acct}
        </div>
      </div>

      <p style={{ color: "#334155" }}>
        Secure, simple, and modern digital banking for demos and learning.
      </p>

      <HomeTiles />
      <ApiInfo />
    </Page>
  );
}

function LoginPage() {
  const nav = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Store tokens in both storages (mock!)
      sessionStorage.setItem("accessToken", json.accessToken);
      sessionStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);

      // Save display name + email for Home greeting
      const displayName =
        (email.split("@")[0] || "Cynthia").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName || "Cynthia");
      localStorage.setItem("email", email);

      // Immediate redirect + hard fallback
      const to = location.state?.from || "/dashboard";
      nav(to, { replace: true });
      setTimeout(() => (window.location.href = to), 300);

      setMessage("Login successful (mock). Redirecting…");
    } catch (e: any) {
      setMessage(`Login failed: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Login">
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="you@example.com"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="********"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
          />
        </label>
        <button
          disabled={loading}
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #0ea5e9",
            background: "#0ea5e9",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {message && (
          <p
            style={{
              color: message.startsWith("Login successful") ? "#16a34a" : "#dc2626",
            }}
          >
            {message}
          </p>
        )}
      </form>
      <p style={{ marginTop: 16, color: "#64748b" }}>
        Tip: any email+password works (mock backend).
      </p>
    </Page>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* Optional: TokenLamp shows Auth: ON/OFF if you kept it */}
      {/* <TokenLamp /> */}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />

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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
