// client/src/components/HomePage.tsx
// Polished home page with greeting banner, account summary, and quick tiles.

import React from "react";
import HomeTiles from "./HomeTiles";

export default function HomePage() {
  const name =
    (typeof window !== "undefined" &&
      (localStorage.getItem("displayName") ||
        sessionStorage.getItem("displayName"))) ||
    "Cynthia";

  // Deterministic 10-digit account number from email (stable per user)
  let acctNum = "0451927466";
  if (typeof window !== "undefined") {
    const email = localStorage.getItem("email") || "cynthia@example.com";
    let h = 0;
    for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
    acctNum = (h % 1_000_000_0000).toString().padStart(10, "0");
  }

  return (
    <main className="grid">
      {/* Greeting banner */}
      <section
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #0ea5e9 55%, #22c55e 100%)",
            color: "white",
            padding: "20px 18px",
          }}
        >
          <h2 style={{ margin: 0 }}>Hello, {name}! 👋</h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.95 }}>
            Welcome back to your CeeBank account.
          </p>
        </div>

        <div style={{ padding: 16 }}>
          <div className="kicker">Account Number</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
            {acctNum}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Welcome to CeeBank</h3>
        <p className="text-muted" style={{ marginTop: 6 }}>
          Secure, simple, and modern digital banking for demos and learning.
          Manage transfers, view balances, and explore a realistic online bank
          interface — powered by Node.js, React, Docker, GitHub Actions, and AWS.
        </p>
      </section>

      {/* Quick actions */}
      <HomeTiles />
    </main>
  );
}
