// src/utils/store.ts

export type Direction = "DEBIT" | "CREDIT";

export type Transaction = {
  to: string;                     // owner of this ledger (same as user's email)
  name: string;                   // display name for owner
  amount: number;
  direction: Direction;
  balance: number;                // balance AFTER this txn
  txnRef: string;
  description?: string;
  toAccount?: string;
  toName?: string;
  when?: string;                  // ISO timestamp
};

export type User = {
  email: string;
  name?: string;
  accountNumber?: string;
  balance: number;
  pin?: string;                   // plain or hashed; for demo, plain is fine
  passwordHash?: string;
  transactions: Transaction[];
};

// ----- In-memory storage (replace with DB in production) -----
const users = new Map<string, User>();

// Utilities
const ensureUser = (email: string): User => {
  let u = users.get(email);
  if (!u) {
    u = {
      email,
      name: email.split("@")[0],
      accountNumber: makeAccountNumber(email),
      balance: 4_000_000,        // default balance you wanted
      transactions: [],
    };
    users.set(email, u);
  }
  return u;
};

const makeAccountNumber = (_seed: string) => {
  // simple deterministic-ish number for demo; NOT for production
  const base = Math.abs(
    Array.from(_seed).reduce((a, c) => (a * 33 + c.charCodeAt(0)) | 0, 7)
  );
  return String(9000000000 + (base % 99999999)).padStart(10, "0");
};

// ----- Public API your routes import -----
export const getUser = (email: string): User | undefined => users.get(email);

export const createOrUpdateUser = (email: string, data: Partial<User>): User => {
  const u = ensureUser(email);
  Object.assign(u, data);
  users.set(email, u);
  return u;
};

export const setBalance = (email: string, newBalance: number): number => {
  const u = ensureUser(email);
  u.balance = newBalance;
  return u.balance;
};

export const listTransactions = (email: string): Transaction[] => {
  const u = ensureUser(email);
  return u.transactions.slice().reverse();
};

export const pushTransaction = (email: string, txn: Transaction): void => {
  const u = ensureUser(email);
  u.transactions.push(txn);
};

export const verifyPin = (email: string, pin: string): boolean => {
  const u = users.get(email);
  if (!u) return false;
  if (!u.pin) return false;
  return String(u.pin) === String(pin);
};

// Optional helpers (used by auth/register route in some versions)
export const setPin = (email: string, pin: string) => {
  const u = ensureUser(email);
  u.pin = pin;
  return true;
};

export const setPassword = (email: string, passwordHash: string) => {
  const u = ensureUser(email);
  u.passwordHash = passwordHash;
  return true;
};

