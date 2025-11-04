// src/routes/auth.ts
// Auth routes with real email sending via SES-backed mailer helpers.
// - POST /api/auth/register         -> creates mock user + sends Welcome (and optional Verify if verifyUrl provided)
// - POST /api/auth/login            -> mock login (returns fake JWTs)
// - POST /api/auth/send-verification-> sends verification email
// - POST /api/auth/request-reset    -> sends password reset email with a mock one-time code
// - POST /api/auth/reset            -> mock reset confirm

import { Router, Request, Response } from "express";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/mailer";

const router = Router();

/** In-memory mock "users" store (for demo only) */
type User = {
  id: string;
  email: string;
  name: string;
  accountNumber: string;
  passwordHash?: string; // not actually hashed in demo
};
const users = new Map<string, User>();

/** Utility: generate a simple mock account number (10 digits) */
function genAccountNumber() {
  return String(Math.floor(10_000_000_00 + Math.random() * 89_999_999_99)).slice(0, 10);
}

/** Utility: tiny input guard */
function bad(res: Response, msg = "Invalid payload", code = 400) {
  return res.status(code).json({ ok: false, error: msg });
}

/**
 * POST /api/auth/register
 * body: { email, password, name, verifyUrl? }
 * - creates a mock user (id/account number)
 * - sends Welcome immediately
 * - if verifyUrl provided, also sends a Verify email
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, verifyUrl } = req.body || {};
    if (!email || !password || !name) return bad(res, "name, email and password are required");

    const id = "user_" + Math.random().toString(36).slice(2, 10);
    const accountNumber = genAccountNumber();

    const user: User = { id, email, name, accountNumber, passwordHash: password /* demo only */ };
    users.set(email, user);

    // Send Welcome (production-safe; uses SES SMTP via envs)
    const welcome = await sendWelcomeEmail(email, name);

    // Optionally also send Verify if a verifyUrl was included
    let verifyStatus: any = undefined;
    if (verifyUrl) {
      verifyStatus = await sendVerificationEmail(email, name, verifyUrl);
    }

    return res.json({
      ok: true,
      user: { id, email, name, accountNumber },
      welcome: welcome.ok ? { sent: true, messageId: welcome.messageId } : { sent: false, error: welcome.error },
      verify:
        verifyUrl && verifyStatus
          ? verifyStatus.ok
            ? { sent: true, messageId: verifyStatus.messageId }
            : { sent: false, error: verifyStatus.error }
          : undefined,
      message: "Registered. Emails dispatched.",
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Register failed" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 * - validates against our mock store (if not found, creates a quick mock user)
 * - returns fake JWTs
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return bad(res, "email and password are required");

    let user = users.get(email);
    if (!user) {
      // auto-provision for demo ease
      const id = "user_" + Math.random().toString(36).slice(2, 10);
      user = {
        id,
        email,
        name: email.split("@")[0] || "User",
        accountNumber: genAccountNumber(),
        passwordHash: password,
      };
      users.set(email, user);
    }

    // fake check (demo only)
    if (user.passwordHash && user.passwordHash !== password) {
      return bad(res, "Invalid credentials", 401);
    }

    // return mock tokens
    return res.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, accountNumber: user.accountNumber },
      accessToken: "mock_access_token_" + user.id,
      refreshToken: "mock_refresh_token_" + user.id,
      message: "Logged in.",
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Login failed" });
  }
});

/**
 * POST /api/auth/send-verification
 * body: { email, name, verifyUrl }
 */
router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { email, name, verifyUrl } = req.body || {};
    if (!email || !verifyUrl) return bad(res, "email and verifyUrl are required");

    const out = await sendVerificationEmail(email, name || "there", verifyUrl);
    if (!out.ok) return res.status(500).json({ ok: false, error: out.error || "Failed to send" });

    return res.json({ ok: true, message: "Verification email sent", messageId: out.messageId });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Send verification failed" });
  }
});

/**
 * POST /api/auth/request-reset
 * body: { email, name?, resetUrl }
 * - generates a mock code and sends reset email
 */
router.post("/request-reset", async (req: Request, res: Response) => {
  try {
    const { email, name, resetUrl } = req.body || {};
    if (!email || !resetUrl) return bad(res, "email and resetUrl are required");

    const code = String(Math.floor(100000 + Math.random() * 899999)); // 6-digit demo code
    const out = await sendPasswordResetEmail(email, name || "there", resetUrl, code);
    if (!out.ok) return res.status(500).json({ ok: false, error: out.error || "Failed to send" });

    // In a real app we'd store the code + expiry. For demo, return it for your UI tests.
    return res.json({ ok: true, message: "Password reset email sent", messageId: out.messageId, demoCode: code });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Request reset failed" });
  }
});

/**
 * POST /api/auth/reset
 * body: { email, code, newPassword }
 * - mock confirm flow (accepts anything)
 */
router.post("/reset", async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) return bad(res, "email, code and newPassword are required");

    const u = users.get(email);
    if (!u) return bad(res, "User not found", 404);
    u.passwordHash = newPassword;

    return res.json({ ok: true, message: "Password updated" });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Reset failed" });
  }
});

export default router;
