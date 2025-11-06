import { Link } from "react-router-dom";

const actions = [
  { to: "/airtime", title: "Buy Airtime", desc: "Top up any network instantly." },
  { to: "/transfer", title: "Transfer", desc: "Send money to banks & wallets." },
  { to: "/bills", title: "Pay Bills", desc: "Utility, TV, internet, more." },
  { to: "/loans", title: "Loans", desc: "Quick loans & offers." },
  { to: "/cards", title: "Virtual Cards", desc: "Create & manage virtual cards." },
  { to: "/qr", title: "QR Payments", desc: "Scan & pay at merchants." },
];

export default function QuickActions() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="text-base font-medium">{a.title}</div>
            <div className="text-sm text-gray-600 mt-1">{a.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}


