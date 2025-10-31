// client/src/App.tsx
// Clean, login-first app with guarded routes, persistent tokens,
// styled Login, external HomePage (greeting + tiles), and DashboardLive.

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

import ApiInfo from "./components/ApiInfo";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./components/HomePage";
import DashboardLive from "./components/DashboardLive";

// ---------- Nav styles ----------
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

// ---------- Navbar ----------
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
        <button className="btn-danger" onClick={onLogout} style={{ marginLeft: 12 }}>
          Logout
        </button>
      )}
    </nav>
  );
}

// ---------- Simple page wrapper ----------
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

// ---------- About ----------
function AboutPage() {
  return (
    <Page title="About CeeBank">
      <p style={{ lineHeight: 1.7 }}>
        CeeBank is a modern online banking demo founded by{" "}
        <strong>Cynthia Udie</strong> (DevOps, Cloud Security Engineer, and Web
        Developer). It showcases full-stack development, containerization, CI/CD,
        and AWS deployment.
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
      <ApiInfo />
    </Page>
  );
}

// ---------- Login (styled, redirect-safe) ----------
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

      // store tokens (mock)
      sessionStorage.setItem("accessToken", json.accessToken);
      sessionStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);

      // name for Home
      const displayName =
        (email.split("@")[0] || "Cynthia").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName || "Cynthia");
      localStorage.setItem("email", email);

      // immediate redirect + hard fallback
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
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(40rem 40rem at 10% -10%, rgba(37,99,235,.08), transparent 60%), radial-gradient(40rem 40rem at 110% 0%, rgba(14,165,233,.08), transparent 60%)",
      }}
    >
      <section className="card" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 14, textAlign: "center" }}>
          <img
            src="/ceebank-logo.svg"
            alt="CeeBank"
            style={{ height: 44, display: "inline-block" }}
          />
          <h2 style={{ margin: "10px 0 0 0" }}>Welcome back</h2>
          <p className="text-muted" style={{ marginTop: 6 }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <label className="grid">
            <span className="kicker">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid">
            <span className="kicker">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="********"
            />
          </label>

          <button disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {message && (
            <p
              style={{
                margin: 0,
                color: message.startsWith("Login successful")
                  ? "#16a34a"
                  : "#dc2626",
              }}
            >
              {message}
            </p>
          )}
        </form>

        <p className="text-muted" style={{ marginTop: 14, fontSize: 13 }}>
          Tip: any email + password works (mock backend).
        </p>
      </section>
    </main>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
