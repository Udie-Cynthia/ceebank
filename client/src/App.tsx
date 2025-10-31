// client/src/App.tsx
// App shell with Router, Navbar (logo + links), and 4 pages:
// - Home: tagline + API info
// - About: founder and project blurb
// - Login: mock form (no real auth yet)
// - Dashboard: demo balance + mock transactions

import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import ApiInfo from "./components/ApiInfo";

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

const linkStyle: React.CSSProperties = { textDecoration: "none", color: "#0f172a", padding: "6px 10px", borderRadius: 8 };
const activeStyle: React.CSSProperties = { background: "#e2e8f0" };

function Navbar() {
  return (
    <nav style={navStyle}>
      <a href="/" style={{ display: "inline-flex", alignItems: "center" }} aria-label="CeeBank Home">
        <img src="/ceebank-logo.svg" alt="CeeBank" width={160} height={40} />
      </a>

      <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
        <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })} end>
          Home
        </NavLink>
        <NavLink to="/about" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
          About
        </NavLink>
        <NavLink to="/login" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
          Login
        </NavLink>
        <NavLink to="/dashboard" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
          Dashboard
        </NavLink>
      </div>

      <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 14 }}>© 2025</span>
    </nav>
  );
}

function Page({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main style={{ fontFamily: "system-ui, Segoe UI, Inter, Arial, sans-serif", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
    </main>
  );
}

function HomePage() {
  return (
    <Page title="Welcome to CeeBank">
      <p style={{ color: "#334155" }}>Secure, simple, and modern digital banking for demos and learning.</p>
      <ApiInfo />
    </Page>
  );
}

function AboutPage() {
  return (
    <Page title="About CeeBank">
      <p style={{ lineHeight: 1.7 }}>
        CeeBank is a modern online banking demo founded by <strong>Cynthia Udie</strong> (DevOps, Cloud Security Engineer, and Web Developer).
        It showcases full-stack development, containerization, CI/CD, and AWS deployment.
      </p>
      <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
        <li>Custom domain: <code>ceebank.online</code> with HTTPS</li>
        <li>Frontend: React (Vite) • Backend: Node.js + Express</li>
        <li>Deployment: Docker, GitHub Actions, AWS EC2/ECS</li>
      </ul>
      <p>Contact: <a href="mailto:udiecynthia@gmail.com">udiecynthia@gmail.com</a> • LinkedIn: linkedin.com/in/cynthia-udie-68936135b</p>
    </Page>
  );
}

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("https://ceebank.online/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Mock store tokens (DO NOT do this in production)
      sessionStorage.setItem("accessToken", json.accessToken);
      sessionStorage.setItem("refreshToken", json.refreshToken);
      setMessage("Login successful (mock). Redirecting…");
      setTimeout(() => nav("/dashboard"), 800);
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
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="you@example.com"
                 style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="********"
                 style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <button disabled={loading} type="submit"
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #0ea5e9", background: "#0ea5e9", color: "white", cursor: "pointer" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {message && <p style={{ color: message.startsWith("Login successful") ? "#16a34a" : "#dc2626" }}>{message}</p>}
      </form>
      <p style={{ marginTop: 16, color: "#64748b" }}>Tip: any email+password works (mock backend).</p>
    </Page>
  );
}

function DashboardPage() {
  // Demo account state (mock)
  const balance = 1250.75;
  const transactions = [
    { id: "tx_001", date: "2025-10-25", desc: "Salary - CeeBank Ltd", amount: +2000.0 },
    { id: "tx_002", date: "2025-10-27", desc: "Electricity Bill", amount: -120.5 },
    { id: "tx_003", date: "2025-10-28", desc: "Groceries", amount: -86.2 },
    { id: "tx_004", date: "2025-10-29", desc: "Coffee", amount: -2.9 },
  ];

  return (
    <Page title="Dashboard">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>Available Balance</h2>
          <p style={{ fontSize: 28, margin: 0 }}><strong>₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
          <p style={{ color: "#64748b", marginTop: 6 }}>Demo funds for showcasing UI only.</p>
        </div>

        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Recent Transactions</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 6px" }}>Date</th>
                <th style={{ padding: "10px 6px" }}>Description</th>
                <th style={{ padding: "10px 6px", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 6px" }}>{t.date}</td>
                  <td style={{ padding: "10px 6px" }}>{t.desc}</td>
                  <td style={{ padding: "10px 6px", textAlign: "right", color: t.amount < 0 ? "#dc2626" : "#16a34a" }}>
                    {t.amount < 0 ? "-" : "+"}₦{Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
