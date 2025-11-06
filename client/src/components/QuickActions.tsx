import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const nav = useNavigate();
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Quick Actions</h1>
      <div className="grid grid-cols-2 gap-3">
        <Tile onClick={() => nav('/airtime')} title="Buy Airtime" desc="Top up any network instantly." />
        <Tile onClick={() => nav('/transfer')} title="Transfer" desc="Send money to banks & wallets." />
        <Tile onClick={() => nav('/bills')} title="Pay Bills" desc="Utility, TV, internet, more." />
        <Tile onClick={() => nav('/loans')} title="Loans" desc="Quick demo loans & offers." />
        <Tile onClick={() => nav('/cards')} title="Virtual Cards" desc="Create and manage virtual cards." />
        <Tile onClick={() => nav('/qr')} title="QR Payments" desc="Scan & pay at merchants." />
      </div>
    </div>
  );
}

function Tile({ onClick, title, desc }: { onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="rounded-xl p-4 shadow hover:shadow-md text-left">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </button>
  );
}
