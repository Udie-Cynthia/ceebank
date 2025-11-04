// server/src/utils/store.ts
// In-memory store for demo banking API (no external deps)

import { createHash } from "crypto";

export type TxnDirection = "DEBIT" | "CREDIT";

export interface Transaction {
  id: string;
  when: string;          // ISO8601
  description?: string;
  amount: number;        // positive
  direction: TxnDirection;
  balance: number;       // balance after txn
  toAccount?: string;
  toName?: string;
  txnRef?: string;
}

export interface User {
  email: string;
  name?: string;
  accountNumber: string;
  pin?: string;            // 4-digit PIN for transactions
  passwordHash?: string;   // login password (hashed)
  balance: number;         // NGN balance
  transactions: Transaction[];
}

const users = new Map<string, User>();

function keyEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomAccountNumber(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

function cryptoId(): string {
  try {
    // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch { /* ignore */ }
  return "cb_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Create (if missing) and optionally set initial fields. Never overwrites existing user fields. */
export function ensureUser(
  email: string,
  initial?: { name?: string; balance?: number; pin?: string; password?: string }
): User {
  const k = keyEmail(email);
  let u = users.get(k);
  if (!u) {
    const initialBalance = Number.isFinite(initial?.balance!) ? Number(initial!.balance) : 1_000_000;
    u = {
      email: k,
      name: initial?.name ?? undefined,
      accountNumber: randomAccountNumber(),
      pin: initial?.pin ?? undefined,
      passwordHash: initial?.password ? sha256(initial.password) : undefined,
      balance: initialBalance,
      transactions: [
        {
          id: cryptoId(),
          when: new Date().toISOString(),
          description: "Initial funding",
          amount: initialBalance,
          direction: "CREDIT",
          balance: initialBalance,
        },
      ],
    };
    users.set(k, u);
  }
  return u;
}

/** Back-compat alias if any route still imports this name */
export const upsertUser = ensureUser;

export function getUser(email: string): User | undefined {
  return users.get(keyEmail(email));
}

/** Set (or change) a user's password; will create user if missing. */
export function setPassword(email: string, password: string): User {
  const u = ensureUser(email);
  u.passwordHash = sha256(password);
  return u;
}

/** Set (or change) a user's 4-digit PIN; will create user if missing. */
export function setPin(email: string, pin: string): User {
  const clean = (pin || "").trim();
  if (!/^\d{4}$/.test(clean)) throw new Error("PIN must be 4 digits");
  const u = ensureUser(email);
  u.pin = clean;
  return u;
}

/** Verify a user's PIN exactly. */
export function verifyPin(email: string, pin: string): boolean {
  const u = getUser(email);
  return !!u && typeof u.pin === "string" && u.pin === (pin || "").trim();
}

/** Hard set new balance and append an adjustment txn. */
export function setBalance(email: string, newBalance: number): User {
  const u = ensureUser(email);
  const next = Number(newBalance);
  if (!Number.isFinite(next) || next < 0) throw new Error("Invalid balance");
  const delta = next - u.balance;
  const direction: TxnDirection = delta >= 0 ? "CREDIT" : "DEBIT";
  const amount = Math.abs(delta);
  u.balance = next;
  u.transactions.push({
    id: cryptoId(),
    when: new Date().toISOString(),
    description: "Balance adjustment",
    amount,
    direction,
    balance: u.balance,
  });
  return u;
}

/** Back-compat for routes that call adjustBalance */
export const adjustBalance = setBalance;

/** Credit funds and write a txn row. */
export function credit(
  email: string,
  amount: number,
  opts?: { description?: string; toAccount?: string; toName?: string; txnRef?: string }
): { balance: number; txn: Transaction } {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) throw new Error("Amount must be a positive number");
  const u = ensureUser(email);
  u.balance += num;
  const txn: Transaction = {
    id: cryptoId(),
    when: new Date().toISOString(),
    description: opts?.description,
    amount: num,
    direction: "CREDIT",
    balance: u.balance,
    toAccount: opts?.toAccount,
    toName: opts?.toName,
    txnRef: opts?.txnRef,
  };
  u.transactions.push(txn);
  return { balance: u.balance, txn };
}

/** Debit funds and write a txn row. */
export function debit(
  email: string,
  amount: number,
  opts?: { description?: string; toAccount?: string; toName?: string; txnRef?: string }
): { balance: number; txn: Transaction } {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) throw new Error("Amount must be a positive number");
  const u = ensureUser(email);
  if (u.balance < num) throw new Error("Insufficient funds");
  u.balance -= num;
  const txn: Transaction = {
    id: cryptoId(),
    when: new Date().toISOString(),
    description: opts?.description,
    amount: num,
    direction: "DEBIT",
    balance: u.balance,
    toAccount: opts?.toAccount,
    toName: opts?.toName,
    txnRef: opts?.txnRef,
  };
  u.transactions.push(txn);
  return { balance: u.balance, txn };
}

export function listTransactions(email: string): Transaction[] {
  const u = getUser(email);
  if (!u) return [];
  // newest first feels nicer on UI — change if you prefer oldest first
  return [...u.transactions].sort((a, b) => b.when.localeCompare(a.when));
}
