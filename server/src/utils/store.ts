// src/utils/store.ts
// Lightweight in-memory "database" for demo use.
// NOTE: This resets on server restart. We'll swap to MongoDB/Postgres later.

export type TxType =
  | "DEBIT_TRANSFER"
  | "CREDIT_TRANSFER"
  | "AIRTIME"
  | "BILL_PAYMENT"
  | "LOAN_DISBURSEMENT"
  | "VIRTUAL_CARD_FUNDING"
  | "QR_PAYMENT";

export interface Transaction {
  id: string;              // unique id for the txn (string)
  type: TxType;            // what happened
  amount: number;          // positive amount in Naira
  description?: string;    // user-visible description
  createdAt: number;       // epoch ms
  balanceAfter: number;    // user balance after this txn
  counterparty?: string;   // e.g., "GTB-22334455" or "Airtel 0803..."
  reference?: string;      // e.g., bank ref or our internal ref
}

export interface User {
  email: string;
  name: string;
  pin: string;             // 4-digit string
  accountNumber: string;   // 10-digit
  balance: number;         // in Naira
  transactions: Transaction[];
}

const users = new Map<string, User>(); // key: email

// ---------- Helpers ----------

// Create a predictable 10-digit account number from email (demo)
function makeAccountNumber(email: string): string {
  // Simple hash-ish: take char codes, sum, pad; purely for demo
  let sum = 0;
  for (const ch of email) sum = (sum + ch.charCodeAt(0)) % 1000000000;
  const base = (sum + 451927466) % 10000000000; // shift to have non-trivial numbers
  return base.toString().padStart(10, "0");
}

export function maskAccount(acct: string): string {
  // e.g., "0451927466" -> "0451•••466"
  if (!acct || acct.length < 6) return "••••••";
  return acct.slice(0, 4) + "•••" + acct.slice(-3);
}

// seeded initial transactions for a new user
function seedInitialTxns(startBalance: number): Transaction[] {
  const now = Date.now();
  return [
    {
      id: cryptoRandomId(),
      type: "LOAN_DISBURSEMENT",
      amount: startBalance,
      description: "Initial funding",
      createdAt: now,
      balanceAfter: startBalance,
    },
  ];
}

// (Not cryptographically secure; demo-only)
export function cryptoRandomId(): string {
  // Avoid importing node crypto here for simplicity; make short id
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Create a new user (fails if already exists)
export function createUser(email: string, name: string, pin: string, initialBalance = 1_000_000): User {
  if (users.has(email)) throw new Error("User already exists");
  if (!/^\d{4}$/.test(pin)) throw new Error("PIN must be 4 digits");

  const accountNumber = makeAccountNumber(email);
  const user: User = {
    email,
    name: name || email.split("@")[0],
    pin,
    accountNumber,
    balance: initialBalance,
    transactions: seedInitialTxns(initialBalance),
  };
  users.set(email, user);
  return user;
}

// Get or undefined
export function getUser(email: string): User | undefined {
  return users.get(email);
}

// Ensure user exists (without changing PIN) — handy for mock login
export function ensureUser(email: string, name?: string): User {
  let u = users.get(email);
  if (!u) {
    // create with a default PIN "0000" if not registered via /register yet
    u = createUser(email, name || email.split("@")[0], "0000", 1_000_000);
  }
  return u;
}

// Validate a 4-digit transaction PIN for user
export function validatePin(email: string, pin: string): boolean {
  const u = users.get(email);
  if (!u) return false;
  return u.pin === pin;
}

// Record a debit; throws if insufficient funds
export function debit(email: string, amount: number, description?: string, counterparty?: string, reference?: string, type: TxType = "DEBIT_TRANSFER"): Transaction {
  const u = users.get(email);
  if (!u) throw new Error("User not found");
  if (amount <= 0) throw new Error("Amount must be positive");
  if (u.balance < amount) throw new Error("Insufficient funds");

  u.balance -= amount;
  const tx: Transaction = {
    id: cryptoRandomId(),
    type,
    amount,
    description,
    createdAt: Date.now(),
    balanceAfter: u.balance,
    counterparty,
    reference,
  };
  u.transactions.unshift(tx);
  return tx;
}

// Record a credit
export function credit(email: string, amount: number, description?: string, counterparty?: string, reference?: string, type: TxType = "CREDIT_TRANSFER"): Transaction {
  const u = users.get(email);
  if (!u) throw new Error("User not found");
  if (amount <= 0) throw new Error("Amount must be positive");

  u.balance += amount;
  const tx: Transaction = {
    id: cryptoRandomId(),
    type,
    amount,
    description,
    createdAt: Date.now(),
    balanceAfter: u.balance,
    counterparty,
    reference,
  };
  u.transactions.unshift(tx);
  return tx;
}

// Get a user's transactions (paginated later if needed)
export function listTransactions(email: string): Transaction[] {
  const u = users.get(email);
  if (!u) throw new Error("User not found");
  return u.transactions;
}

// Update a user's PIN (later used by /reset-password or /set-pin)
export function setPin(email: string, newPin: string) {
  if (!/^\d{4}$/.test(newPin)) throw new Error("PIN must be 4 digits");
  const u = users.get(email);
  if (!u) throw new Error("User not found");
  u.pin = newPin;
  return true;
}

// Expose for diagnostics (optional)
export function _debugAllUsers() {
  return Array.from(users.values()).map(u => ({
    email: u.email,
    name: u.name,
    accountNumber: u.accountNumber,
    balance: u.balance,
    txCount: u.transactions.length,
  }));
}
