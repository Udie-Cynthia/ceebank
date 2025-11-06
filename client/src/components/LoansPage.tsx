export default function LoansPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold">Loans</h1>
      <p className="text-sm text-gray-600 mt-1">Quick demo loans & offers.</p>
      <div className="mt-4 space-y-3">
        <input className="w-full border rounded-lg p-2" placeholder="Requested amount" type="number" />
        <select className="w-full border rounded-lg p-2">
          <option>Tenor</option>
          <option>1 month</option>
          <option>3 months</option>
          <option>6 months</option>
        </select>
        <button className="w-full rounded-lg bg-black text-white p-2 font-medium">Check Eligibility</button>
      </div>
    </div>
  );
}
