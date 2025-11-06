import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const nav = useNavigate();
  const go = (path: string) => () => nav(path);

  const Card = (p: { title: string; subtitle: string; onClick?: () => void; gradient: string }) => (
    <div className="card" style={{
      background: p.gradient,
      border: "1px solid rgba(255,255,255,.08)",
      cursor: p.onClick ? "pointer" : "default"
    }} onClick={p.onClick}>
      <div className="h2">{p.title}</div>
      <div className="muted">{p.subtitle}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: "0 16px" }}>
      <div className="grid grid-3">
        <Card title="Buy Airtime" subtitle="Top up any network instantly." gradient="linear-gradient(180deg,#173358,#0e1d35)" />
        <Card title="Transfer" subtitle="Send money to banks & wallets." gradient="linear-gradient(180deg,#1b3b6a,#0f2541)" onClick={go('/transfer')} />
        <Card title="Pay Bills" subtitle="Utility, TV, internet, more." gradient="linear-gradient(180deg,#2b2f52,#191c30)" />
        <Card title="Loans" subtitle="Quick loans & offers." gradient="linear-gradient(180deg,#27402f,#16261c)" />
        <Card title="Virtual Cards" subtitle="Create & manage virtual cards." gradient="linear-gradient(180deg,#3a2b43,#241b2b)" />
        <Card title="QR Payments" subtitle="Scan & pay at merchants." gradient="linear-gradient(180deg,#3a3030,#231a1a)" />
      </div>
    </div>
  );
}

