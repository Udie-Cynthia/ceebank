export default function BillsPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold">Pay Bills</h1>
      <p className="text-sm text-gray-600 mt-1">Utility, TV, internet, more.</p>
      <div className="mt-4 space-y-3">
        <select className="w-full border rounded-lg p-2">
          <option>Choose biller</option>
          <option>Electricity</option>
          <option>Cable TV</option>
          <option>Internet</option>
        </select>
        <input className="w-full border rounded-lg p-2" placeholder="Customer/Smart Card Number" />
        <input className="w-full border rounded-lg p-2" placeholder="Amount" type="number" />
        <button className="w-full rounded-lg bg-black text-white p-2 font-medium">Continue</button>
      </div>
    </div>
  );
}
