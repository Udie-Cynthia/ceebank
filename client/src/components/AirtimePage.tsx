export default function AirtimePage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold">Buy Airtime</h1>
      <p className="text-sm text-gray-600 mt-1">Top up any network instantly.</p>
      <div className="mt-4 space-y-3">
        <input className="w-full border rounded-lg p-2" placeholder="Phone number" />
        <input className="w-full border rounded-lg p-2" placeholder="Amount" type="number" />
        <button className="w-full rounded-lg bg-black text-white p-2 font-medium">Continue</button>
      </div>
    </div>
  );
}
