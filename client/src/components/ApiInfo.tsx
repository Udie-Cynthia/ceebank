// client/src/components/ApiInfo.tsx
// Fetches the CeeBank API metadata and renders it.

import React from "react";

type Info = {
  name: string;
  version: string;
  description: string;
};

export default function ApiInfo() {
  const [data, setData] = React.useState<Info | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/api/info", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as Info;
      })
      .then((json) => setData(json))
      .catch((e: unknown) => {
        if ((e as any)?.name !== "AbortError") setError(String(e));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) return <p style={{ color: "#64748b" }}>Loading API info</p>;
  if (error) return <p style={{ color: "#dc2626" }}>Error: {error}</p>;
  if (!data) return null;

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#ffffff",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>API Info</h2>
      <dl style={{ margin: 0, lineHeight: 1.8 }}>
        <div>
          <dt style={{ fontWeight: 600, display: "inline" }}>Name: </dt>
          <dd style={{ display: "inline", marginLeft: 6 }}>{data.name}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, display: "inline" }}>Version: </dt>
          <dd style={{ display: "inline", marginLeft: 6 }}>{data.version}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, display: "inline" }}>Description: </dt>
          <dd style={{ display: "inline", marginLeft: 6 }}>{data.description}</dd>
        </div>
      </dl>
    </section>
  );
}
