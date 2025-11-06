// client/src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export type AccountResponse = {
  ok: boolean;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
};

export async function getAccount(email: string): Promise<AccountResponse> {
  const r = await fetch(`${API_BASE}/auth/account?email=${encodeURIComponent(email)}`, { credentials: "include" });
  return r.json();
}

export type TransferBody = {
  email: string;
  pin: string;
  toAccount: string;
  toName: string;
  toEmail?: string;
  amount: number;
  description?: string;
};

export async function transfer(body: TransferBody) {
  const r = await fetch(`${API_BASE}/transactions/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return r.json();
}
