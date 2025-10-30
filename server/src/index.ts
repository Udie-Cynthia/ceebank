// server/src/index.ts
// Minimal Express server entry for CeeBank API.
// NOTE: We haven’t installed dependencies yet; TypeScript may show red squiggles for now.

import express from "express";

const app = express();

// Parse JSON bodies for API requests
app.use(express.json());

// Simple health check endpoint for uptime monitoring and ECS target health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "CeeBank API" });
});

// Pick the port from the environment (ECS/containers) or default locally
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Start the HTTP server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CeeBank API listening on http://localhost:${PORT}`);
});

export default app;

