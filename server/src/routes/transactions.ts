import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  getUser,
  verifyPin,
  setBalance,
  pushTransaction,
  listTransactions,
  type User,
} from "../utils/store";
import { sendTxnReceiptEmail } from "../utils/mailer";

const router = Router();

/**
 * POST /api/transactions/transfer
 * Body: { email, pin, toAccount, toName, toEmail?, amount, description? }
 */
router.post("/transfer", async (req: Request, res: Response) => {
  try {
    const {
      email,
      pin,
      toAccount,
      toName,
      toEmail, // used only for emailing (not stored)
      amount,
      description,
    } = req.body ?? {};

    if (!email || !pin || !toAccount || !toName) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ ok: false, error: "Amount must be a positive number." });
    }

    const sender = getUser(email);
    if (!sender) {
      return res.status(404).json({ ok: false, error: "Sender not found" });
    }

    if (!verifyPin(email, String(pin))) {
      return res.status(401).json({ ok: false, error: "Invalid PIN" });
    }

    const currentBalance: number = sender.balance;
    if (currentBalance < amt) {
      return res.status(400).json({ ok: false, error: "Insufficient funds" });
    }

    const nowIso = new Date().toISOString();
    const shortRef = nanoid(6).toUpperCase();
    const reference = `CB-${Date.now()}-${shortRef}`;

    const newBalance = currentBalance - amt;
    setBalance(email, newBalance);

    // Store DEBIT txn for sender — NOTE: no 'toEmail' here
    pushTransaction(email, {
      to: email,
      name: sender.name || email,
      amount: amt,
      direction: "DEBIT",
      balance: newBalance,
      txnRef: reference,
      description: description || `Transfer to ${toName}`,
      toAccount,
      toName,
      when: nowIso,
    });

    // Email receipts (best-effort)
    try {
      await sendTxnReceiptEmail({
        toEmail: email,
        toName: sender.name || "Customer",
        type: "DEBIT",
        amount: amt,
        balanceAfter: newBalance,
        counterpartyName: toName,
        counterpartyAccount: toAccount,
        reference,
        description: description || "",
        whenIso: nowIso,
      });

      if (toEmail) {
        await sendTxnReceiptEmail({
          toEmail,
          toName: toName,
          type: "CREDIT",
          amount: amt,
          balanceAfter: undefined, // unknown for recipient
          counterpartyName: sender.name || email,
          counterpartyAccount: sender.accountNumber,
          reference,
          description: description || "",
          whenIso: nowIso,
        });
      }
    } catch (e) {
      console.error("[mail] transfer receipt error:", (e as Error).message);
    }

    return res.json({
      ok: true,
      reference,
      balance: newBalance,
      message: "Transfer successful",
    });
  } catch (err) {
    console.error("[transfer] error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/transactions/list?email=...
 */
router.get("/list", (req: Request, res: Response) => {
  const email = String(req.query.email || "");
  if (!email) {
    return res.status(400).json({ ok: false, error: "email is required" });
  }
  const user = getUser(email);
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }
  const items = listTransactions(email);
  return res.json({ ok: true, items });
});

export default router;
