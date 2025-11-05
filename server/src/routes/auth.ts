// server/src/routes/auth.ts
import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/mailer";
import { ensureUser, getUser, setPassword, setPin } from "../utils/store"; // in-memory helpers
import { Router } from "express";
import { getUser, createOrUpdateUser } from "../utils/store";

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
/** GET /api/auth/account?email=...  */
router.get("/account", (req, res) => {
  const email = String(req.query.email || "");
  if (!email) return res.status(400).json({ ok: false, error: "email is required" });
  const u = getUser(email);
  if (!u) return res.status(404).json({ ok: false, error: "User not found" });
  const { name, accountNumber, balance } = u;
  return res.json({ ok: true, email, name, accountNumber, balance });
});

// ---------- GET /api/auth/account ----------
router.get("/account", async (req, res) => {
  try {
    const email = (req.query.email as string)?.toLowerCase();
    if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

    const { getUser } = await import("../utils/store");
    const user = getUser(email);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const { passwordHash, ...safe } = user;
    res.json({ ok: true, ...safe });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


/* export default router; (keep existing) */

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
router.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "email and password are required" });
  }

  // Auto-create user on first login for demo
  let u = getUser(email);
  if (!u) {
    u = createOrUpdateUser(email, { name: email.split("@")[0] });
  }

  // If no password is set in store, accept any password (demo mode).
  // If you later add hashing, check against hash here.
  return res.json({
    ok: true,
    email: u.email,
    name: u.name,
    accountNumber: u.accountNumber,
    balance: u.balance,
    message: "Login successful",
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
