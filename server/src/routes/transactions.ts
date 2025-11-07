// server/src/routes/transactions.ts
import { Router, Request, Response } from 'express';
import { ensureUser, getUser, verifyPin, setBalance, recordTransaction, User } from '../utils/store';

const router = Router();

function genRef() {
  return `CB-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

/* POST /api/transactions/transfer
   body: { email, pin, toAccount, toName, toEmail?, amount, description } */
router.post('/transfer', (req: Request, res: Response) => {
  const { email, pin, toAccount, toName, toEmail, amount, description } = req.body || {};

  if (!email || !pin || !toAccount || !toName || !amount) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (amount <= 0) {
    return res.status(400).json({ ok: false, error: 'Amount must be > 0' });
  }

  const user = getUser(email as string);
  if (!user) return res.status(404).json({ ok: false, error: 'Sender not found' });

  if (!verifyPin(user as User, pin as string)) {
    return res.status(401).json({ ok: false, error: 'Invalid PIN' });
  }
  if (user.balance < amount) {
    return res.status(400).json({ ok: false, error: 'Insufficient balance' });
  }

  // Apply debit
  const newBal = user.balance - amount;
  setBalance(user.email, newBal);

  const txnRef = genRef();
  recordTransaction(user.email, {
    to: user.email,
    name: user.name,
    amount,
    direction: 'DEBIT',
    balance: newBal,
    txnRef,
    description,
    toAccount,
    toName,
    toEmail,
    when: new Date().toISOString(),
  });

  // (Optional) Here you’d also credit a recipient account if you had a real ledger/recipient model.

  return res.json({ ok: true, reference: txnRef, balance: newBal, message: 'Transfer successful' });
});

// --- Recent transactions (read-only) ---
router.get('/recent', (req, res) => {
  try {
    const rawEmail = String(req.query.email ?? '').trim();
    const email = rawEmail.toLowerCase();
    const limitParam = String(req.query.limit ?? '10');
    const limit = Math.max(1, Math.min(50, parseInt(limitParam, 10) || 10));

    if (!email) {
      return res.status(400).json({ ok: false, error: 'Missing email' });
    }

    const user = getUser(email);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    // Many of our routes push transactions onto user.transactions.
    // If it doesn’t exist yet, return an empty list gracefully.
    const txns = Array.isArray((user as any).transactions)
      ? (user as any).transactions
      : [];

    const recent = txns.slice(-limit).reverse(); // newest first
    return res.json({ ok: true, transactions: recent });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Failed to fetch transactions' });
  }
});


export default router;

