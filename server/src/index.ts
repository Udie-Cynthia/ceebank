// server/src/index.ts
// CeeBank API bootstrap (Express + CORS + routers)

import express from "express";
import cors from "cors";
import helmet from "helmet";

import infoRoutes from "./routes/info";
import authRoutes from "./routes/auth";
import transactionsRoutes from "./routes/transactions";
import debugRoutes from "./routes/debug";

const app = express();

// Basic hardening + JSON body parser + CORS
app.use(helmet({
  contentSecurityPolicy: { useDefaults: true },
}));
app.use(cors());
app.use(express.json());
app.use("/api/debug", debugRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ceebank-api", ts: new Date().toISOString() });
});

// Mount routers (these must exist)
app.use("/api/info", infoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
  }
  return next();
});

// Start server
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`[ceebank-api] listening on port ${PORT}`);
});

export default app;
