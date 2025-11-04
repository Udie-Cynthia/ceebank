// server/src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth";
import infoRouter from "./routes/info";
import txRouter from "./routes/transactions";
import debugRouter from "./routes/debug";

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "upgrade-insecure-requests": null,
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "script-src-attr": ["'none'"],
      },
    },
  }) as any
);

// health/info
app.get("/health", (_req, res) => res.json({ ok: true, service: "ceebank-api", ts: new Date().toISOString() }));
app.use("/api/info", infoRouter);

// main routers
app.use("/api/auth", authRouter);
app.use("/api/transactions", txRouter);
app.use("/api/debug", debugRouter);

// 404
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`[ceebank-api] listening on port ${PORT}`);
});
