// server/src/utils/store.ts

/* -------------------- Types -------------------- */
export type Direction = 'DEBIT' | 'CREDIT';

export type Transaction = {
  to: string;                 // recipient email (or account owner email)
  name: string;               // recipient display name
  amount: number;
  direction: Direction;
  balance: number;            // balance AFTER applying this txn
  txnRef: string;
  description?: string;
  toAccount?: string;
  toName?: string;
  toEmail?: string;           // <- add optional recipient email for receipts
  when?: string;
};

export type User = {
  email: string;
  name: string;
  accountNumber: string;
  password?: string;          // demo only (not for production)
  pin?: string;               // demo only (not for production)
  balance: number;
  transactions: Transaction[];
};

/* -------------------- In-memory DB -------------------- */
const db = new Map<string, User>();

/* -------------------- Helpers -------------------- */
function genAccountNumber(): string {
  // 10-digit random
  return String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
}

/* -------------------- Exports -------------------- */
export function ensureUser(email: string, defaults: Partial<User> = {}): User {
  let u = db.get(email);
  if (!u) {
    u = {
      email,
      name: defaults.name ?? email.split('@')[0],
      accountNumber: defaults.accountNumber ?? genAccountNumber(),
      password: defaults.password,
      pin: defaults.pin,
      balance: defaults.balance ?? 4_000_000, // your preferred starting balance
      transactions: [],
    };
    db.set(email, u);
  }
  return u;
}

export function getUser(email: string): User | undefined {
  return db.get(email);
}

export function setPassword(email: string, password: string): void {
  const u = ensureUser(email);
  u.password = password;
}

export function setPin(email: string, pin: string): void {
  const u = ensureUser(email);
  u.pin = pin;
}

export function verifyPin(user: User, pin: string): boolean {
  return !!user.pin && user.pin === pin;
}

export function setBalance(email: string, balance: number): number {
  const u = ensureUser(email);
  u.balance = balance;
  return u.balance;
}

export function recordTransaction(email: string, txn: Transaction): Transaction {
  const u = ensureUser(email);
  u.transactions.unshift(txn);
  return txn;
}

export function listTransactions(email: string): Transaction[] {
  return ensureUser(email).transactions;
}

export function snapshot(): User[] {
  return Array.from(db.values());
}

