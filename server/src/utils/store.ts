// server/src/utils/store.ts
// Extremely simple in-memory store for demo.
// Replace with a real DB in production.

export type UserRecord = {
  email: string;
  name: string;
  passwordHash?: string;   // plain for demo
  pin?: string;            // 4-digit
  accountNumber: string;   // fake acct no
  balance: number;         // NGN
};

const users = new Map<string, UserRecord>();

function randomAccountNumber(): string {
  // 10-digit random
  return String(Math.floor(1e9 + Math.random() * 9e9));
}

export function ensureUser(email: string): UserRecord {
  const existing = users.get(email);
  if (existing) return existing;
  const rec: UserRecord = {
    email,
    name: email.split("@")[0],
    accountNumber: randomAccountNumber(),
    balance: 4_000_000, // seed with 1M for testing
  };
  users.set(email, rec);
  return rec;
}

export function getUser(email: string): UserRecord | undefined {
  return users.get(email);
}

export function setPassword(email: string, passwordPlain: string) {
  const u = ensureUser(email);
  u.passwordHash = passwordPlain; // do NOT do this in prod
}

export function setPin(email: string, pin: string) {
  const u = ensureUser(email);
  u.pin = pin;
}

export function adjustBalance(email: string, delta: number): number {
  const u = ensureUser(email);
  u.balance = Math.max(0, (u.balance || 0) + delta);
  return u.balance;
}
