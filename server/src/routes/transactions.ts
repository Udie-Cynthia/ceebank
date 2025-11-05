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

export default router;

    