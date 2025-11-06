import { Link } from "react-router-dom";

type ActionCardProps = {
  to: string;
  title: string;
  desc: string;
};

function ActionCard({ to, title, desc }: ActionCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition p-4"
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{desc}</div>
    </Link>
  );
}

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <ActionCard to="/airtime" title="Buy Airtime" desc="Top up any network instantly." />
      <ActionCard to="/transfer" title="Transfer" desc="Send money to banks & wallets." />
      <ActionCard to="/bills" title="Pay Bills" desc="Utility, TV, internet, more." />
      <ActionCard to="/loans" title="Loans" desc="Quick demo loans & offers." />
      <ActionCard to="/cards" title="Virtual Cards" desc="Create and manage virtual cards." />
      <ActionCard to="/qr" title="QR Payments" desc="Scan & pay at merchants." />
    </div>
  );
}
