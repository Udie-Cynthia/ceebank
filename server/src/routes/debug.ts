// server/src/routes/debug.ts
import { Router } from "express";
import { canSend } from "../utils/mailer";

const router = Router();

router.get("/email-capability", (_req, res) => {
  res.json({
    ok: true,
    canSend: canSend(),
  });
});

export default router;


