// server/src/routes/transactions.ts
// Demo in-memory account + transactions API for CeeBank.
// NOTE: This uses in-memory storage for demo/testing only.
//       Restarting the server will reset balances/transactions.

import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Demo user id used by mock auth
const DEMO_USER_ID = "user_mock_123";
const CURRENCY = "NGN";

// Seed demo account state (large starting balance for testing transfers)
const demoAccount: {
  userId: string;
  balance: number; // smallest unit is Naira with decimals; we'll use normal float for demo
  currency: string;
} = {
  userId: DEMO_USER_ID,
  balance: 1_000_000.0, // 1,000,000.00 NGN starting balance
  currency: CURRENCY,
};

// Seed demo transactions (most recent first)
const transactions: Array<{
  id: string;
  userId: string;
  date: string; // ISO/date string
  description: string;
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
}> = [
  {
    id: uuidv4(),
    userId: DEMO_USER_ID,
    date: new Date().toISOString().slice(0, 10),
    description: "Initial demo funding",
    amount: +1_000_000.0,
    balanceAfter: demoAccount.balance,
  },
];

// Helper: format JSON responses
function accountPayload() {
  return {
    userId: demoAccount.userId,
    balance: demoAccount.balance,
    currency: demoAccount.currency,
  };
}

/**
 * GET /api/account
 * Returns demo account info: userId, balance, currency
 */
router.get("/account", (_req, res) => {
  res.json(accountPayload());
});

/**
 * GET /api/transactions
 * Returns list of transactions for the demo user (most recent first).
 * Supports optional ?limit= (integer).
 */
router.get("/transactions", (req, res) => {
  const limit = Math.max(0, parseInt(String(req.query.limit ?? "0")));
  const list = limit > 0 ? transactions.slice(0, limit) : transactions;
  res.json({ count: list.length, transactions: list });
});

/**
 * POST /api/transactions/transfer
 * Body: { to: string, amount: number, description?: string }
 * Performs basic validation and updates the in-memory balance + ledger.
 */
router.post("/transactions/transfer", (req, res) => {
  const { to, amount, description } = req.body ?? {};
  const amt = Number(amount);
  if (!to || !amount || Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid transfer payload. Need 'to' and positive 'amount'." });
  }

  // Simple insufficient funds check
  if (amt > demoAccount.balance) {
    return res.status(400).json({ error: "Insufficient funds for this transfer." });
  }

  // Debit from demo user
  demoAccount.balance = Number((demoAccount.balance - amt).toFixed(2));

  const txDebit = {
    id: uuidv4(),
    userId: DEMO_USER_ID,
    date: new Date().toISOString().slice(0, 10),
    description: `Transfer to ${String(to)}${description ? " — " + String(description) : ""}`,
    amount: -Math.abs(amt),
    balanceAfter: demoAccount.balance,
  };

  // For demo, also create a corresponding incoming credit transaction (optional)
  const txCredit = {
    id: uuidv4(),
    userId: DEMO_USER_ID,
    date: new Date().toISOString().slice(0, 10),
    description: `Received by ${String(to)} (simulation)`,
    amount: 0.0, // we won't actually increase balance for the "to" user in demo
    balanceAfter: demoAccount.balance,
  };

  // Prepend so newest are first
  transactions.unshift(txDebit, txCredit);

  return res.status(201).json({
    message: "Transfer processed (demo).",
    account: accountPayload(),
    transaction: txDebit,
  });
});

export default router;
