// server/src/routes/transactions.ts
import { Router, Request, Response } from "express";
import { ensureUser, getUser, adjustBalance, verifyPin } from "../utils/store";
import { sendTxnReceiptEmail } from "../utils/mailer";

const router = Router();

/**
 * POST /api/transactions/transfer
 * Body:
 * {
 *   email: string,            // sender email (must exist)
 *   pin: string,              // 4-digit PIN
 *   toAccount: string,        // e.g. 'GTB-22334455'
 *   toName?: string,          // recipient display name
 *   toEmail?: string,         // optional: if provided, send them a receipt too
 *   amount: number,           // in NGN
 *   description?: string
 * }
 */
router.post("/transfer", async (req: Request, res: Response) => {
  try {
    const { email, pin, toAccount, toName, toEmail, amount, description } = req.body || {};

    if (!email || !pin || !toAccount || typeof amount !== "number") {
      return res.status(400).json({
        ok: false,
        error: "email, pin, toAccount, amount are required",
      });
    }
    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({ ok: false, error: "pin must be a 4-digit code" });
    }
    if (amount <= 0) {
      return res.status(400).json({ ok: false, error: "amount must be > 0" });
    }

    const sender = getUser(email);
    if (!sender) {
      return res.status(404).json({ ok: false, error: "Sender not found" });
    }
    if (!verifyPin(email, pin)) {
      return res.status(401).json({ ok: false, error: "Invalid PIN" });
    }
    if ((sender.balance || 0) < amount) {
      return res.status(400).json({ ok: false, error: "Insufficient balance" });
    }

    // Perform transfer (debit sender)
    const newBal = adjustBalance(email, -amount);

    // Generate a reference
    const txnRef = `CB-${Date.now()}-${Math.floor(Math.random() * 1e6)
      .toString()
      .padStart(6, "0")}`;

    // Email receipt to sender
    await sendTxnReceiptEmail({
      to: email,
      name: sender.name || "Customer",
      amount,
      direction: "DEBIT",
      balance: newBal,
      txnRef,
      description,
      toAccount,
      toName,
      when: new Date().toISOString(),
    });

    // Optionally email the counterparty (if an email was provided)
    if (toEmail) {
      const counterpartyName = toName || toEmail.split("@")[0] || "Recipient";
      await sendTxnReceiptEmail({
        to: toEmail,
        name: counterpartyName,
        amount,
        direction: "CREDIT",
        balance: 0, // unknown for external
        txnRef,
        description,
        toAccount, // from sender's POV, this still shows the dest
        toName: sender.name || "CeeBank Customer",
        when: new Date().toISOString(),
      });
    }

    return res.json({
      ok: true,
      reference: txnRef,
      balance: newBal,
      message: "Transfer successful",
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

/**
 * Simple account summary
 * GET /api/transactions/summary?email=...
 */
router.get("/summary", (req: Request, res: Response) => {
  const email = String(req.query.email || "");
  if (!email) return res.status(400).json({ ok: false, error: "email is required" });

  const u = ensureUser(email);
  res.json({
    ok: true,
    email: u.email,
    name: u.name,
    accountNumber: u.accountNumber,
    balance: u.balance,
  });
});

export default router;
