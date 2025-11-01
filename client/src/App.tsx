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

      // Store tokens (mock)
      sessionStorage.setItem("accessToken", json.accessToken);
      sessionStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);

      // Save name/email for Home greeting
      const displayName =
        (email.split("@")[0] || "Cynthia").replace(/[^a-zA-Z ]/g, "");
      localStorage.setItem("displayName", displayName || "Cynthia");
      localStorage.setItem("email", email);

      // Redirect
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
          <h2 style={{ margin: "10px 0 0 0" }}>Sign in to CeeBank</h2>
          <p className="text-muted" style={{ marginTop: 6 }}>
            Access your dashboard using your email and password.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <label className="grid">
            <span className="kicker">Email Address</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="name@email.com"
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

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" defaultChecked />
            <span className="text-muted">Stay signed in for 30 days</span>
          </label>

          <button disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign In"}
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

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-muted">
            Forgot Password?
          </a>
          <div
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 12,
              textAlign: "center",
            }}
          >
            <span className="text-muted">Not enrolled?</span>{" "}
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </section>
    </main>
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
