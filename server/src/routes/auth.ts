import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ensureUser, getUser, upsertUser } from "../utils/store";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/mailer";

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 10 });
router.use(limiter);

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth" });
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, pin } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ ok: false, error: "email, password, name are required" });
    }
    if (!/^\d{4}$/.test(String(pin || ""))) {
      return res.status(400).json({ ok: false, error: "PIN must be 4 digits" });
    }

    const u = ensureUser(email);
    u.name = name;
    u.hashedPassword = `mock:${password}`;
    u.pin = String(pin);
    upsertUser(u);

    sendWelcomeEmail({ toEmail: email, name }).catch(() => {});
    const verifyUrl = req.body.verifyUrl || "https://ceebank.online/login";
    sendVerificationEmail({ toEmail: email, name, verifyUrl }).catch(() => {});

    return res.json({
      ok: true,
      user: { email: u.email, name: u.name, accountNumber: u.accountNumber },
      message: "Registration successful"
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Register failed" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const u = getUser(email || "");
  if (!u || u.hashedPassword !== `mock:${password}`) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
  res.json({
    ok: true,
    user: { email: u.email, name: u.name, accountNumber: u.accountNumber },
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token"
  });
});

router.post("/send-verification", async (req, res) => {
  try {
    const { email, name, verifyUrl } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "email is required" });
    const out = await sendVerificationEmail({ toEmail: email, name: name || email, verifyUrl: verifyUrl || "https://ceebank.online/login" });
    return res.status(out.ok ? 200 : 500).json(out);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "send-verification failed" });
  }
});

export default router;
