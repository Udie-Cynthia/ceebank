export default function CardsPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold">Virtual Cards</h1>
      <p className="text-sm text-gray-600 mt-1">Create and manage virtual cards.</p>
      <div className="mt-4 space-y-3">
        <button className="w-full rounded-lg bg-black text-white p-2 font-medium">Create New Card</button>
        <div className="text-xs text-gray-500">No cards yet.</div>
      </div>
    </div>
  );
}
