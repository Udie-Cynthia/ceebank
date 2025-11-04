import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ensureUser, getUser, upsertUser } from "../utils/store";
import { sendTxnReceiptEmail } from "../utils/mailer";

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 20 });
router.use(limiter);

function ref() {
  const stamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const rnd = Math.random().toString(36).slice(2,6).toUpperCase();
  return `CEE-${stamp}-${rnd}`;
}

router.post("/transfer", async (req, res) => {
  try {
    const { email, pin, toAccount, toName, amount, description } = req.body || {};
    if (!email || !toAccount || !toName || !amount) {
      return res.status(400).json({ ok: false, error: "email, toAccount, toName, amount are required" });
    }
    if (!/^\d{4}$/.test(String(pin || ""))) {
      return res.status(400).json({ ok: false, error: "Valid 4-digit PIN required" });
    }

    const sender = getUser(email);
    if (!sender) return res.status(404).json({ ok: false, error: "User not found" });
    if (sender.pin !== String(pin)) return res.status(401).json({ ok: false, error: "Incorrect PIN" });

    const amountKobo = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid amount" });
    }

    sender.balance = (sender.balance ?? 0) - amountKobo;
    const balanceAfter = (sender.balance ?? 0);
    upsertUser(sender);

    const receiver = ensureUser(`${toAccount}@ceebank.mock`);
    receiver.name = toName;
    upsertUser(receiver);

    const reference = ref();
    const nowIso = new Date().toISOString();

    sendTxnReceiptEmail({
      toEmail: sender.email,
      role: "SENDER",
      amountNaira: Number(amount),
      description,
      reference,
      counterpartyName: toName,
      counterpartyAccount: toAccount,
      balanceAfterNaira: Number((balanceAfter / 100).toFixed(2)),
      dateIso: nowIso
    }).catch(() => {});

    sendTxnReceiptEmail({
      toEmail: receiver.email,
      role: "RECEIVER",
      amountNaira: Number(amount),
      description,
      reference,
      counterpartyName: sender.name || sender.email,
      counterpartyAccount: sender.accountNumber || "N/A",
      dateIso: nowIso
    }).catch(() => {});

    return res.json({
      ok: true,
      reference,
      amount: Number(amount),
      description,
      balanceAfter: Number((balanceAfter / 100).toFixed(2))
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "transfer failed" });
  }
});

export default router;
