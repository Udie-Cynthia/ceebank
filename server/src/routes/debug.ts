// server/src/routes/debug.ts
import { Router, Request, Response } from "express";
import { verifySmtp } from "../utils/mailer";

const router = Router();

// GET /api/debug/smtp - checks SMTP connectivity/creds
router.get("/smtp", async (_req: Request, res: Response) => {
  try {
    const info = await verifySmtp();
    return res.json({ ok: true, info });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err),
    });
  }
});

export default router;
