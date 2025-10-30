// server/src/index.ts
// Minimal Express server entry for CeeBank API with env helper.

import infoRouter from "./routes/info";
import express from "express";
import { env, warnIfInsecure } from "./config/env";

const app = express();

// Parse JSON bodies for API requests
app.use(express.json());
app.use("/api/info", infoRouter);

// Simple health check endpoint for uptime monitoring and ECS target health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "CeeBank API" });
});

// Warn if placeholder/missing secrets in non-prod
warnIfInsecure();

// Start the HTTP server on configured port
app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CeeBank API listening on http://localhost:${env.PORT}`);
});

export default app;

