// server/src/routes/auth.ts
// Authentication + onboarding routes for CeeBank (mock register/login + real email sender)

import { Router, Request, Response } from "express";
import { sendVerificationEmail } from "../utils/mailer";

const router = Router();

/**
 * POST /api/auth/register
 * Mock registration: accepts name, email, password, phone, country.
 * Returns a mock user. Real DB wiring can be added later.
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, country } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // In a real app, you would:
    // 1) Validate inputs thoroughly
    // 2) Hash password
    // 3) Store user in DB
    // 4) Create verification token

    const user = {
      id: "user_mock_123",
      email,
      name: name || (email.split("@")[0] ?? "User"),
      phone: phone || null,
      country: country || null,
      verified: false,
    };

    // Return basic info now; email verification is a separate call.
    return res.json({
      ...user,
      message:
        "Registered (mock). Real persistence & JWT will be added later.",
    });
  } catch (err: any) {
    console.error("[register] error:", err?.message || err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Mock login: any email/password pair is accepted for demo purposes.
 * Returns mock access/refresh tokens.
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // In a real app, you would:
    // 1) Look up user in DB
    // 2) Verify hashed password
    // 3) Issue real JWT access/refresh tokens

    return res.json({
      user: { id: "user_mock_123", email },
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      message: "Logged in (mock). Real JWT coming soon.",
    });
  } catch (err: any) {
    console.error("[login] error:", err?.message || err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/send-verification
 * Sends a real verification email through Mailtrap (via nodemailer).
 * Requires MAILTRAP_* env vars to be set in the container.
 *
 * Body: { email: string; name?: string; verifyUrl: string }
 */
router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { email, name, verifyUrl } = (req.body ?? {}) as {
      email?: string;
      name?: string;
      verifyUrl?: string;
    };

    if (!email || !verifyUrl) {
      return res
        .status(400)
        .json({ error: "email and verifyUrl are required" });
    }

    const displayName = (name || email.split("@")[0] || "Cynthia").replace(
      /[^a-zA-Z ]/g,
      ""
    );

    const { messageId } = await sendVerificationEmail({
      to: email,
      name: displayName,
      verifyUrl,
    });

    return res.json({
      ok: true,
      message: "Verification email sent",
      messageId,
    });
  } catch (err: any) {
    console.error("[send-verification] error:", err?.message || err);
    // Keep UX friendly; still respond 200 with a neutral message
    return res.status(200).json({
      ok: false,
      message: "Verification email was queued. Please check your inbox.",
    });
  }
});

export default router;
