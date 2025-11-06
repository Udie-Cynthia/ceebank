import { Link } from "react-router-dom";

type Props = { compact?: boolean };

const actions = [
  { to: "/airtime", title: "Buy Airtime", desc: "Top up any network instantly." },
  { to: "/transfer", title: "Transfer", desc: "Send money to banks & wallets." },
  { to: "/pay-bills", title: "Pay Bills", desc: "Utility, TV, internet, more." },
  { to: "/loans", title: "Loans", desc: "Quick demo loans & offers." },
  { to: "/cards", title: "Virtual Cards", desc: "Create and manage virtual cards." },
  { to: "/qr", title: "QR Payments", desc: "Scan & pay at merchants." },
];

export default function QuickActions({ compact }: Props) {
  return (
    <div className={compact ? "" : "mt-6"}>
      {!compact && <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="block rounded-lg border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="font-medium">{a.title}</div>
            <div className="text-sm text-gray-600 mt-1">{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
