// client/src/main.tsx
// Render App with routes (navbar + pages)

import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

createRoot(container).render(<App />);
