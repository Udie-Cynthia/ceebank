// client/src/components/HomePage.tsx
// Polished home page with greeting, account summary, and quick tiles.

import React from "react";
import HomeTiles from "./HomeTiles";

export default function HomePage() {
  const name = localStorage.getItem("displayName") || "Cynthia";
  const acctNum = "2321-8843-9923"; // mock account number

  return (
    <main className="grid">
      {/* Greeting card */}
      <section className="card" style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Hello, {name}! 👋</h2>
        <p style={{ margin: 0 }} className="text-muted">
          Welcome back to your CeeBank account
        </p>
        <p style={{ fontWeight: 600, fontSize: 18, marginTop: 10 }}>
          Account No: <span style={{ color: "#2563eb" }}>{acctNum}</span>
        </p>
      </section>

      {/* Intro */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Welcome to CeeBank</h3>
        <p>
          Secure, simple, and modern digital banking for demos and learning.
          Manage transfers, view balances, and explore a realistic online bank
          interface — all powered by Node.js, React, and Docker.
        </p>
      </section>

      {/* Quick actions */}
      <HomeTiles />
    </main>
  );
}
