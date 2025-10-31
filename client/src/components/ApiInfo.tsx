// client/src/components/ApiInfo.tsx
// Shows server info by calling the API through Nginx proxy on the same origin.

import React from "react";

export default function ApiInfo() {
  const [info, setInfo] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // IMPORTANT: relative URL so it works on https://ceebank.online via Nginx proxy
    fetch("/api/info")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setInfo(json);
      })
      .catch((e) => setError(e.message ?? String(e)));
  }, []);

  if (error) {
    return (
      <div style={{ padding: 12, border: "1px solid #fecaca", background: "#fee2e2", borderRadius: 8, color: "#991b1b" }}>
        Error: {error}
      </div>
    );
  }

  if (!info) {
    return <p style={{ color: "#64748b" }}>Loading API info…</p>;
  }

  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}

   