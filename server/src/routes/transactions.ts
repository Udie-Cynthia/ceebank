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
 * Notes:
 *  - We only store the sender's transactions in the in-memory store.
 *  - Email receipts are sent (sender + optional recipient) via SES if configured.
 */
router.post("/transfer", async (req: Request, res: Response) => {
  try {
    const {
      email,
      pin,
      toAccount,
      toName,
      toEmail, // used only for sending a receipt, NOT stored in tx object
      amount,
      description,
    } = req.body ?? {};

    // Basic validation
    if (!email || !pin || !toAccount || !toName) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields." });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ ok: false, error: "Amount must be a positive number." });
    }

    // Sender lookup
    const sender = getUser(email);
    if (!sender) {
      return res.status(404).json({ ok: false, error: "Sender not found" });
    }

    // PIN check
    const pinOk = verifyPin(email, String(pin));
    if (!pinOk) {
      return res.status(401).json({ ok: false, error: "Invalid PIN" });
    }

    // Balance check (THIS was the CI error: do NOT assign a User to a number)
    const currentBalance: number = sender.balance;
    if (currentBalance < amt) {
      return res
        .status(400)
        .json({ ok: false, error: "Insufficient funds" });
    }

    // Generate reference & timestamps
    const nowIso = new Date().toISOString();
    const shortRef = nanoid(6).toUpperCase();
    const reference = `CB-${Date.now()}-${shortRef}`;

    // Compute new balance and persist
    const newBalance = currentBalance - amt;
    setBalance(email, newBalance);

    // Record the DEBIT transaction for the sender
    pushTransaction(email, {
      to: email, // owner of this ledger
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

    // Fire off email receipts (best-effort; do not fail the transfer if email fails)
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
          balanceAfter: undefined, // unknown for recipient outside our system
          counterpartyName: sender.name || email,
          counterpartyAccount: sender.accountNumber,
          reference,
          description: description || "",
          whenIso: nowIso,
        });
      }
    } catch (e) {
      // Log-only; we don't block the successful transfer on mail errors
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
