// client/src/main.tsx
// React entry point for CeeBank (Vite will load this).
// NOTE: Dependencies aren't installed yet; we'll do that after file creation.

import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>CeeBank</h1>
      <p>Modern online banking — coming soon.</p>
    </main>
  );
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container #root not found");
}
const root = createRoot(container);
root.render(<App />);
