// src/routes/auth.ts
// Authentication & user-comms routes (mock user store, real email).
// Endpoints used by the client today:
//   POST /api/auth/register        { email, password, name, pin }  (pin = 4 digits)
//   POST /api/auth/login           { email, password }
//   POST /api/auth/send-verification { email, name, verifyUrl }
//   POST /api/auth/send-password-reset { email, name, resetUrl }
//   GET  /api/auth/health

import { Router, Request, Response } from "express";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../utils/mailer";

const router = Router();

// --- tiny in-memory mock "users" bucket for the demo ---
interface DemoUser {
  id: string;
  email: string;
  name: string;
  pin: string; // 4-digit
  verified: boolean;
  balance: number;
  accountNumber: string;
}
const demoUsers = new Map<string, DemoUser>();

function maskAccount(acct: string) {
  if (acct.length < 6) return acct;
  return `${acct.slice(0, 4)}•••${acct.slice(-3)}`;
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function isValidPin(p: string) {
  return /^\d{4}$/.test(p);
}

router.get("/health", (_req, res) => {
  res.json({
    name: "CeeBank API",
    version: "0.1.0",
    description: "Modern online banking demo API",
  });
});

// Register: accepts a 4-digit PIN and triggers welcome + verification
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, pin } = req.body || {};
    if (!email || !password || !name || !pin) {
      return res.status(400).json({ error: "email, password, name and pin are required" });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
    if (!isValidPin(pin)) return res.status(400).json({ error: "PIN must be 4 digits" });

    // create or upsert mock user
    let user = demoUsers.get(email);
    if (!user) {
      user = {
        id: "user_" + Math.random().toString(36).slice(2, 10),
        email,
        name,
        pin,
        verified: false,
        balance: 1_000_000,             // starting demo balance
        accountNumber: "0451927466",
      };
    } else {
      user.name = name;
      user.pin = pin;
    }
    demoUsers.set(email, user);

    // Fire-and-forget emails (don’t fail registration if mail fails)
    const verifyUrl = "https://ceebank.online/login";
    Promise.allSettled([
      sendWelcomeEmail(email, name),
      sendVerificationEmail(email, name, verifyUrl),
    ]).catch(() => { /* ignore */ });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      accountMasked: maskAccount(user.accountNumber),
      message: "Registration successful. A verification email has been sent to your inbox.",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Registration failed" });
  }
});

// Login (mock) – returns tokens + user info
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });

  let user = demoUsers.get(email);
  if (!user) {
    // auto-provision a minimal profile so the demo works even without prior register
    user = {
      id: "user_" + Math.random().toString(36).slice(2, 10),
      email,
      name: email.split("@")[0],
      pin: "0000",
      verified: false,
      balance: 1_000_000,
      accountNumber: "0451927466",
    };
    demoUsers.set(email, user);
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      verified: user.verified,
      accountMasked: maskAccount(user.accountNumber),
    },
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
    message: "Logged in.",
  });
});

// Re-send verification email
router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { email, name, verifyUrl } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ ok: false, error: "Invalid email" });

    const info = await sendVerificationEmail(email, name || email.split("@")[0], verifyUrl || "https://ceebank.online/login");
    return res.json({ ok: true, message: "Verification email sent", messageId: info.messageId });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Failed to send verification email" });
  }
});

// Send password reset email
router.post("/send-password-reset", async (req: Request, res: Response) => {
  try {
    const { email, name, resetUrl } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ ok: false, error: "Invalid email" });

    const info = await sendPasswordResetEmail(email, name || email.split("@")[0], resetUrl || "https://ceebank.online/reset");
    return res.json({ ok: true, message: "Password reset email sent", messageId: info.messageId });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Failed to send password reset email" });
  }
});

export default router;
