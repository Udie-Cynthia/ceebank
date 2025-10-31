// client/src/components/HomeTiles.tsx
// Realistic action tiles for the home page (UI-only for now)

import React from "react";
import { useNavigate } from "react-router-dom";

type Tile = {
  key: string;
  title: string;
  desc: string;
  action?: () => void;
};

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
};

export default function HomeTiles() {
  const nav = useNavigate();

  const tiles: Tile[] = [
    {
      key: "airtime",
      title: "Buy Airtime",
      desc: "Top up any network instantly.",
    },
    {
      key: "transfer",
      title: "Transfer",
      desc: "Send money to banks & wallets.",
      action: () => nav("/dashboard"),
    },
    {
      key: "bills",
      title: "Pay Bills",
      desc: "Utility, TV, internet, more.",
    },
    {
      key: "loans",
      title: "Loans",
      desc: "Quick demo loans & offers.",
    },
    {
      key: "cards",
      title: "Virtual Cards",
      desc: "Create and manage virtual cards.",
    },
    {
      key: "qr",
      title: "QR Payments",
      desc: "Scan & pay at merchants.",
    },
  ];

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h2 style={{ margin: "0 0 8px 0" }}>Quick Actions</h2>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        {tiles.map((t) => (
          <button
            key={t.key}
            onClick={t.action}
            style={{
              ...card,
              textAlign: "left",
              cursor: t.action ? "pointer" : "default",
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t.title}</div>
            <div style={{ color: "#64748b", marginTop: 6 }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
