import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  ensureUser,
  getUser,
  setPassword,
  setPin,
} from '../utils/store';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/mailer';

const router = Router();

// limit auth endpoints
const limiter = rateLimit({ windowMs: 60_000, max: 5 });
router.use(limiter);

/** Health */
router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'auth', ts: new Date().toISOString() });
});

/** Register: email, password, name, pin */
router.post('/register', (req, res) => {
  const { email, password, name, pin } = req.body || {};
  if (!email || !password || !name || !pin) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  const user = ensureUser(email, name);
  setPassword(email, password);
  setPin(email, pin);

  // fire & forget emails (positional args)
  // ignore failures so registration succeeds in demo
  try { void sendVerificationEmail(email, name, 'https://ceebank.online/login'); } catch {}
  try { void sendWelcomeEmail(email, name); } catch {}

  return res.json({
    ok: true,
    message: 'Registered. Email sent.',
    user: { email: user.email, name: user.name, accountNumber: user.accountNumber },
  });
});

/** Login: demo-friendly — checks only that the user exists */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing fields' });

  const user = getUser(email);
  if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  // If you later add verifyPassword in store.ts, swap this block to use it.
  return res.json({
    ok: true,
    user: { email: user.email, name: user.name, accountNumber: user.accountNumber },
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
  });
});

/** Account profile for dashboard */
router.get('/account', (req, res) => {
  const email = (req.query.email as string) || '';
  if (!email) return res.status(400).json({ ok: false, error: 'email is required' });
  const user = getUser(email);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  return res.json({
    ok: true,
    email: user.email,
    name: user.name,
    accountNumber: user.accountNumber,
    balance: user.balance,
  });
});

/** Send verification (manual trigger) */
router.post('/send-verification', async (req, res) => {
  const { email, name, verifyUrl } = req.body || {};
  if (!email || !name || !verifyUrl) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  try {
    // positional args
    const r: any = await sendVerificationEmail(email, name, verifyUrl);
    // be tolerant to different return shapes
    const messageId = r?.messageId ?? r?.id ?? undefined;
    const simulated = r?.simulated ?? false;
    return res.json({ ok: true, message: 'Verification email sent', messageId, simulated });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Failed to send' });
  }
});

export default router;
