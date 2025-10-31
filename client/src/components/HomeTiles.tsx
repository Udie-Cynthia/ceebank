// client/src/components/HomeTiles.tsx
// Realistic action tiles for the home page (styled)

import React from "react";
import { useNavigate } from "react-router-dom";

type Tile = {
  key: string;
  title: string;
  desc: string;
  action?: () => void;
};

export default function HomeTiles() {
  const nav = useNavigate();

  const tiles: Tile[] = [
    { key: "airtime",  title: "Buy Airtime",   desc: "Top up any network instantly." },
    { key: "transfer", title: "Transfer",      desc: "Send money to banks & wallets.", action: () => nav("/dashboard") },
    { key: "bills",    title: "Pay Bills",     desc: "Utility, TV, internet, more." },
    { key: "loans",    title: "Loans",         desc: "Quick demo loans & offers." },
    { key: "cards",    title: "Virtual Cards", desc: "Create and manage virtual cards." },
    { key: "qr",       title: "QR Payments",   desc: "Scan & pay at merchants." },
  ];

  return (
    <section className="card" role="region" aria-label="Quick actions">
      <h2 style={{ margin: "0 0 10px 0" }}>Quick Actions</h2>
      <div className="grid-tiles">
        {tiles.map((t) => (
          <button
            key={t.key}
            className="tile"
            onClick={t.action}
            aria-label={t.title}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t.title}</div>
            <div className="text-muted" style={{ marginTop: 6 }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
