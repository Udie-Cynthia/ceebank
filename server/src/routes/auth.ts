import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  isSmtpReady,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendTxnReceiptEmail,
} from "../utils/mailer";

const router = Router();

// Light rate limiting for email endpoints
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

function bad(res: any, status: number, error: string) {
  return res.status(status).json({ ok: false, error });
}

// Health
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth", smtpReady: isSmtpReady() });
});

// POST /api/auth/send-verification
// body: { email, name, verifyUrl }
router.post("/send-verification", emailLimiter, async (req, res) => {
  const { email, name, verifyUrl } = req.body || {};
  if (!email || !verifyUrl) {
    return bad(res, 400, "email and verifyUrl are required");
  }
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "Customer";

  const result = await sendVerificationEmail(email, safeName, verifyUrl);
  if (!("ok" in result) || !result.ok) {
    return bad(res, 500, result && "error" in result ? result.error : "send failed");
  }
  return res.json({ ok: true, message: "Verification email sent", messageId: result.messageId, simulated: result.simulated });
});

// POST /api/auth/send-welcome
// body: { email, name }
router.post("/send-welcome", emailLimiter, async (req, res) => {
  const { email, name } = req.body || {};
  if (!email) return bad(res, 400, "email is required");
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "Customer";

  const result = await sendWelcomeEmail(email, safeName);
  if (!result.ok) return bad(res, 500, result.error);
  return res.json({ ok: true, message: "Welcome email sent", messageId: result.messageId, simulated: result.simulated });
});

// POST /api/auth/send-txn-receipt
// body: { to, name, type, amount, reference, timestampISO, balanceAfter, note?, counterparty? }
router.post("/send-txn-receipt", emailLimiter, async (req, res) => {
  const { to, name, type, amount, reference, timestampISO, balanceAfter, note, counterparty } = req.body || {};
  if (!to || !type || typeof amount !== "number" || !reference || !timestampISO || typeof balanceAfter !== "number") {
    return bad(res, 400, "to, type, amount, reference, timestampISO, balanceAfter are required");
  }
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "Customer";

  const result = await sendTxnReceiptEmail({
    to, name: safeName, type, amount, reference, timestampISO, balanceAfter, note, counterparty,
  });
  if (!result.ok) return bad(res, 500, result.error);
  return res.json({ ok: true, message: "Transaction receipt sent", messageId: result.messageId, simulated: result.simulated });
});

export default router;

