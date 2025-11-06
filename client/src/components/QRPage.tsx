export default function QRPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold">QR Payments</h1>
      <p className="text-sm text-gray-600 mt-1">Scan & pay at merchants.</p>
      <div className="mt-4 space-y-3">
        <button className="w-full rounded-lg border p-2 font-medium">Open Camera (demo)</button>
        <div className="text-xs text-gray-500">QR scan simulation coming soon.</div>
      </div>
    </div>
  );
}
