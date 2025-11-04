// server/src/routes/info.ts
// Minimal read-only route: GET /api/info -> returns app metadata.

import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    name: "CeeBank API",
    version: "0.1.0",
    description: "Modern online banking demo API",
  });
});

export default router;
