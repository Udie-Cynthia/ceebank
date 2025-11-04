// server/src/utils/store.ts

export type UserRecord = {
  email: string;
  name: string;
  hashedPassword?: string;  // mock hash in this demo
  pin?: string;             // 4-digit transaction code
  accountNumber: string;    // 10-digit NGN style
  balance: number;          // stored in kobo (NGN * 100)
};

/** In-memory user store (per-process). */
const users = new Map<string, UserRecord>();

/** Generate a 10-digit account number that starts with 0-9 */
function genAccountNumber(): string {
  // Keep it simple & deterministic enough for demo usage
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  // Avoid leading zeros that might look odd? Nigerian accounts can start with 0; we’ll keep as-is.
  return s;
}

/** Read user by email (case-insensitive). */
export function getUser(email: string): UserRecord | undefined {
  return users.get((email || "").toLowerCase());
}

/** Insert or update a user. */
export function upsertUser(u: UserRecord) {
  users.set(u.email.toLowerCase(), u);
}

/**
 * Ensure a user exists; if not, create with sensible defaults:
 * - ₦4,000,000.00 balance
 * - Random 10-digit account number
 */
export function ensureUser(email: string): UserRecord {
  const key = (email || "").toLowerCase();
  let u = users.get(key);
  if (!u) {
    u = {
      email: key,
      name: email.split("@")[0] || "User",
      hashedPassword: undefined,
      pin: undefined,
      accountNumber: genAccountNumber(),
      balance: 4_000_000_00, // ₦4,000,000.00
    };
    users.set(key, u);
  }
  return u;
}

/** Utility: debit the user's balance (kobo). Throws on insufficient funds. */
export function debit(user: UserRecord, amountKobo: number) {
  if (amountKobo <= 0) throw new Error("Amount must be positive");
  if ((user.balance ?? 0) < amountKobo) throw new Error("Insufficient funds");
  user.balance -= amountKobo;
  upsertUser(user);
}

/** Utility: credit the user's balance (kobo). */
export function credit(user: UserRecord, amountKobo: number) {
  if (amountKobo <= 0) throw new Error("Amount must be positive");
  user.balance += amountKobo;
  upsertUser(user);
}
