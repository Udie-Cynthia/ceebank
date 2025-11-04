import { Router } from "express";
import { isSmtpReady } from "../utils/mailer";

const router = Router();

// Simple SMTP status for debugging in EC2
router.get("/smtp-status", (_req, res) => {
  res.json({
    ok: true,
    smtpReady: isSmtpReady(),
    hasHost: Boolean(process.env.MAIL_HOST),
    hasUser: Boolean(process.env.MAIL_USER),
    hasPass: Boolean(process.env.MAIL_PASS),
    from: process.env.MAIL_FROM || null,
  });
});

export default router;

