import React from 'react';
import { useNavigate } from 'react-router-dom';

function Card({ title, subtitle, to, disabled }: { title: string; subtitle: string; to?: string; disabled?: boolean }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => to && nav(to)}
      disabled={disabled}
      className="text-left rounded-2xl border p-4 bg-white hover:bg-gray-50 disabled:opacity-60 w-full"
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </button>
  );
}

export default function QuickActions() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Buy Airtime" subtitle="Top up any network instantly." disabled />
        <Card title="Transfer" subtitle="Send money to banks & wallets." to="/transfer" />
        <Card title="Pay Bills" subtitle="Utility, TV, internet, more." disabled />
        <Card title="Loans" subtitle="Quick demo loans & offers." disabled />
        <Card title="Virtual Cards" subtitle="Create and manage virtual cards." disabled />
        <Card title="QR Payments" subtitle="Scan & pay at merchants." disabled />
      </div>
    </section>
  );
}
