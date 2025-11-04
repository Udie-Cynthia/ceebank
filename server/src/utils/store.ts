// server/src/utils/store.ts
// Lightweight in-memory demo store for users & transactions

export type TxnDirection = "DEBIT" | "CREDIT";

export interface Transaction {
  id: string;            // unique id
  when: string;          // ISO string
  description?: string;
  amount: number;        // positive number
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
  pin?: string;          // 4-digit
  balance: number;       // in NGN
  transactions: Transaction[];
}

const users = new Map<string, User>();

function randomAccountNumber(): string {
  // 10-digit number string
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

/**
 * Ensure a user exists. Optionally set partial fields at creation time.
 * If user exists, returns it unchanged (does not overwrite existing fields).
 */
export function ensureUser(
  email: string,
  initial?: { name?: string; balance?: number; pin?: string }
): User {
  const key = email.trim().toLowerCase();
  let u = users.get(key);
  if (!u) {
    u = {
      email: key,
      name: initial?.name ?? undefined,
      accountNumber: randomAccountNumber(),
      pin: initial?.pin ?? undefined,
      balance: initial?.balance ?? 1_000_000, // default seed
      transactions: [
        {
          id: cryptoRandomId(),
          when: new Date().toISOString(),
          description: "Initial funding",
          amount: initial?.balance ?? 1_000_000,
          direction: "CREDIT",
          balance: initial?.balance ?? 1_000_000,
        },
      ],
    };
    users.set(key, u);
  }
  return u;
}

export function getUser(email: string): User | undefined {
  return users.get(email.trim().toLowerCase());
}

/** Hard set the user balance (admin/debug use). Adds a correcting txn. */
export function setBalance(email: string, newBalance: number): User {
  const u = ensureUser(email);
  const delta = newBalance - u.balance;
  const direction: TxnDirection = delta >= 0 ? "CREDIT" : "DEBIT";
  const amount = Math.abs(delta);
  if (amount > 0) {
    u.balance = newBalance;
    u.transactions.push({
      id: cryptoRandomId(),
      when: new Date().toISOString(),
      description: "Admin balance adjustment",
      amount,
      direction,
      balance: u.balance,
    });
  } else {
    // equal: still record a no-op txn for audit clarity
    u.transactions.push({
      id: cryptoRandomId(),
      when: new Date().toISOString(),
      description: "Admin balance set (no change)",
      amount: 0,
      direction: "CREDIT",
      balance: u.balance,
    });
  }
  return u;
}

export function setPin(email: string, pin: string): User {
  const u = ensureUser(email);
  u.pin = pin;
  return u;
}

/** Credit funds and append transaction */
export function credit(email: string, amount: number, opts?: {
  description?: string;
  toAccount?: string;
  toName?: string;
  txnRef?: string;
}): { balance: number; txn: Transaction } {
  if (amount <= 0 || !Number.isFinite(amount)) {
    throw new Error("Amount must be a positive number");
  }
  const u = ensureUser(email);
  u.balance += amount;
  const txn: Transaction = {
    id: cryptoRandomId(),
    when: new Date().toISOString(),
    description: opts?.description,
    amount,
    direction: "CREDIT",
    balance: u.balance,
    toAccount: opts?.toAccount,
    toName: opts?.toName,
    txnRef: opts?.txnRef,
  };
  u.transactions.push(txn);
  return { balance: u.balance, txn };
}

/** Debit funds and append transaction */
export function debit(email: string, amount: number, opts?: {
  description?: string;
  toAccount?: string;
  toName?: string;
  txnRef?: string;
}): { balance: number; txn: Transaction } {
  if (amount <= 0 || !Number.isFinite(amount)) {
    throw new Error("Amount must be a positive number");
  }
  const u = ensureUser(email);
  if (u.balance < amount) {
    throw new Error("Insufficient funds");
  }
  u.balance -= amount;
  const txn: Transaction = {
    id: cryptoRandomId(),
    when: new Date().toISOString(),
    description: opts?.description,
    amount,
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
  return u ? [...u.transactions].sort((a, b) => a.when.localeCompare(b.when)) : [];
}

function cryptoRandomId(): string {
  // node 20 has crypto.randomUUID
  try {
    // @ts-ignore
    return (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || randFallback();
  } catch {
    return randFallback();
  }
}
function randFallback(): string {
  return "cb_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
