// server/src/routes/debug.ts
import { Router, Request, Response } from 'express';
import { ensureUser, getUser, setBalance } from '../utils/store';

const router = Router();

/* POST /api/debug/seed
   body: { email, name?, balance? } */
router.post('/seed', (req: Request, res: Response) => {
  const { email, name, balance } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: 'email required' });

  const u = ensureUser(email, { name, balance });
  if (typeof balance === 'number') setBalance(email, balance);

  return res.json({ ok: true, user: { email: u.email, name: u.name, accountNumber: u.accountNumber, balance: u.balance } });
});

/* GET /api/debug/user?email=... */
router.get('/user', (req: Request, res: Response) => {
  const email = String(req.query.email || '');
  const u = getUser(email);
  if (!u) return res.status(404).json({ ok: false, error: 'not found' });
  return res.json({ ok: true, user: u });
});

export default router;
