// server/src/routes/auth.ts
import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/mailer";
import { ensureUser, getUser, setPassword, setPin } from "../utils/store"; // in-memory helpers

const router = Router();

// 60s window, max 5 reqs
const limiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth" });
});

/**
 * Register: create or update a user with name/password/pin
 * Body: { email, password, name, pin, verifyUrl? }
 * - Stores user (in-memory for now)
 * - Sends verification email
 */
router.post("/register", limiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name, pin, verifyUrl } = req.body || {};
    if (!email || !password || !name || !pin) {
      return res.status(400).json({ ok: false, error: "email, password, name, pin are required" });
    }
    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({ ok: false, error: "pin must be a 4-digit code" });
    }

    const user = ensureUser(email);
    user.name = name;
    setPassword(email, password);
    setPin(email, pin);

    // Send verification email if verifyUrl provided; otherwise just welcome
    if (verifyUrl) {
      const r = await sendVerificationEmail(email, name, verifyUrl);
      if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
    } else {
      const r = await sendWelcomeEmail(email, name);
      if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
    }

    return res.json({
      ok: true,
      message: "Registered. Email sent.",
      user: { email, name },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

/**
 * Login: Body { email, password }
 * (Mock auth using in-memory store)
 */
router.post("/login", limiter, async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "email and password are required" });
  }
  const user = getUser(email);
  if (!user || user.passwordHash !== password) {
    // NOTE: for demo we stored plain, but treat as hash interface
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
  return res.json({
    ok: true,
    user: { email, name: user.name, accountNumber: user.accountNumber },
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
  });
});

/**
 * Send verification: Body { email, name, verifyUrl }
 */
router.post("/send-verification", limiter, async (req: Request, res: Response) => {
  const { email, name, verifyUrl } = req.body || {};
  if (!email || !verifyUrl) {
    return res.status(400).json({ ok: false, error: "email and verifyUrl are required" });
  }
  const r = await sendVerificationEmail(email, name || "", verifyUrl);
  return r.ok ? res.json(r) : res.status(500).json(r);
});

/**
 * Send welcome: Body { email, name }
 */
router.post("/send-welcome", limiter, async (req: Request, res: Response) => {
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: "email is required" });
  const r = await sendWelcomeEmail(email, name || "");
  return r.ok ? res.json(r) : res.status(500).json(r);
});

export default router;
