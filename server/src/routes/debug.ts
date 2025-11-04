// server/src/routes/debug.ts
import { Router, Request, Response } from "express";
import {
  ensureUser,
  setBalance,
  setPin,
  getUser,
} from "../utils/store";

const router = Router();

/**
 * GET /api/debug/health
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "debug", ts: new Date().toISOString() });
});

/**
 * GET /api/debug/user?email=...
 * Returns the stored user (safe fields only if your store exposes them).
 */
router.get("/user", (req: Request, res: Response) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ ok: false, error: "email required" });

  const user = getUser(email);
  if (!user) return res.status(404).json({ ok: false, error: "User not found" });

  res.json({ ok: true, user });
});

/**
 * POST /api/debug/set-balance
 * { email: string, balance: number }
 */
router.post("/set-balance", (req: Request, res: Response) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const balance = Number(req.body.balance);

  if (!email) return res.status(400).json({ ok: false, error: "email required" });
  if (!Number.isFinite(balance) || balance < 0)
    return res.status(400).json({ ok: false, error: "valid non-negative balance required" });

  ensureUser(email);
  setBalance(email, balance);
  res.json({ ok: true, email, balance });
});

/**
 * POST /api/debug/set-pin
 * { email: string, pin: string }  // 4 digits recommended
 */
router.post("/set-pin", (req: Request, res: Response) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const pin = String(req.body.pin || "").trim();

  if (!email) return res.status(400).json({ ok: false, error: "email required" });
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ ok: false, error: "pin must be 4 digits" });

  ensureUser(email);
  setPin(email, pin);
  res.json({ ok: true, email, pinSet: true });
});

/**
 * POST /api/debug/seed-user
 * { email: string, name?: string, balance?: number, pin?: string }
 * Creates (or ensures) a user and applies optional fields.
 */
router.post("/seed-user", (req: Request, res: Response) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const name = req.body.name ? String(req.body.name).trim() : undefined;
  const balance = req.body.balance !== undefined ? Number(req.body.balance) : undefined;
  const pin = req.body.pin ? String(req.body.pin).trim() : undefined;

  if (!email) return res.status(400).json({ ok: false, error: "email required" });

  const user = ensureUser(email, { name }); // if your ensureUser accepts partials
  if (balance !== undefined) {
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({ ok: false, error: "valid non-negative balance required" });
    }
    setBalance(email, balance);
  }
  if (pin !== undefined) {
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ ok: false, error: "pin must be 4 digits" });
    }
    setPin(email, pin);
  }

  const seeded = getUser(email);
  res.json({ ok: true, user: seeded });
});

export default router;


