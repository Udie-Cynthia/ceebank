// server/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { ensureUser, getUser, setPassword, setPin } from '../utils/store';

const router = Router();

/* GET /api/auth/health */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'auth', ts: new Date().toISOString() });
});

/* POST /api/auth/register
   body: { email, password, name, pin } */
router.post('/register', (req: Request, res: Response) => {
  const { email, password, name, pin } = req.body || {};
  if (!email || !password || !name || !pin) {
    return res.status(400).json({ ok: false, error: 'Missing fields (email, password, name, pin).' });
  }

  const user = ensureUser(email, { name });
  setPassword(email, password);
  setPin(email, pin);

  return res.json({
    ok: true,
    message: 'Registered',
    user: { email: user.email, name: user.name, accountNumber: user.accountNumber },
  });
});

/* POST /api/auth/login
   body: { email, password } */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const user = getUser(email || '');
  if (!user || user.password !== password) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }
  // Demo tokens
  return res.json({
    ok: true,
    user: { email: user.email, name: user.name, accountNumber: user.accountNumber },
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
  });
});

/* GET /api/auth/account?email=... */
router.get('/account', (req: Request, res: Response) => {
  const email = String(req.query.email || '');
  const user = getUser(email);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }
  return res.json({
    ok: true,
    email: user.email,
    name: user.name,
    accountNumber: user.accountNumber,
    balance: user.balance,
  });
});

export default router;
