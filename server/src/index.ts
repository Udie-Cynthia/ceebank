// server/src/index.ts
// Minimal Express server entry for CeeBank API with env helper.

import infoRouter from "./routes/info";
import express from "express";
import { env, warnIfInsecure } from "./config/env";
import authRouter from "./routes/auth";
import transactionsRouter from "./routes/transactions";



const app = express();

// Parse JSON bodies for API requests
app.use(express.json());
// Allow browser app (Vite on 5173) to call this API (CORS)
app.use("/api", transactionsRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

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

