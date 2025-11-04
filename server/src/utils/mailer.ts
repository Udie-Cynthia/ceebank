// src/utils/mailer.ts
// Centralized email helpers for CeeBank.
// Uses SMTP creds (SES recommended) from env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
//
// Exports:
//   - sendVerificationEmail(to, name, verifyUrl)
//   - sendWelcomeEmail(to, name)
//   - sendPasswordResetEmail(to, name, resetUrl)
//   - sendTransactionReceiptEmail(payload)
//   - verifySmtp()

import nodemailer from "nodemailer";

type TxKind =
  | "Transfer - Debit"
  | "Transfer - Credit"
  | "Airtime"
  | "Bill Payment"
  | "Loan Disbursement"
  | "Virtual Card Funding"
  | "QR Payment";

export function createTransporter() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not fully configured (HOST/USER/PASS).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465=SSL, 587=STARTTLS
    auth: { user, pass },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.MAIL_FROM || "CeeBank <no-reply@ceebank.online>";
  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, html });
  return { messageId: info.messageId };
}

// ---- small format helpers ----
function formatNaira(amount: number) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(
      amount
    );
  } catch {
    // fallback
    return `₦${amount.toFixed(2)}`;
  }
}

function formatDateTime(epochMs: number) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(epochMs);
  } catch {
    return new Date(epochMs).toISOString();
  }
}

const brandTop = (title: string, preheader = "") => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0b1220;padding:24px 0;text-align:center">
    <div style="max-width:640px;margin:0 auto;padding:0 16px">
      <div style="display:flex;align-items:center;gap:10px;justify-content:center">
        <img src="https://ceebank.online/ceebank-logo.svg" alt="CeeBank" width="36" height="36" style="display:block"/>
        <span style="color:#e2e8f0;font-size:20px;font-weight:700;letter-spacing:0.4px">CeeBank</span>
      </div>
      <h1 style="color:#e2e8f0;margin:16px 0 0;font-size:22px;font-weight:700">${title}</h1>
      ${preheader ? `<div style="color:#9aa4b2;font-size:13px;margin-top:6px">${preheader}</div>` : ""}
    </div>
  </div>
`;

const brandBottom = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0b1220;padding:20px 0;margin-top:24px">
    <div style="max-width:640px;margin:0 auto;padding:0 16px;color:#93a4b1;font-size:12px;line-height:1.5;text-align:center">
      © 2025 CeeBank. All Rights Reserved.
      <div style="margin-top:8px">If you didn’t request this message, please ignore it.</div>
    </div>
  </div>
`;

// ---- public email APIs ----
export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  const body = `
    ${brandTop("Verify your email")}
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0 0 12px;color:#0b1220;font-size:15px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px;color:#0b1220">Thanks for creating your CeeBank account. Please confirm your email address to secure your account.</p>
      <p style="margin:20px 0">
        <a href="${verifyUrl}"
           style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600">
          Verify my email
        </a>
      </p>
      <p style="margin:16px 0 0;color:#334155;font-size:13px">If the button doesn’t work, copy and paste this link:</p>
      <div style="font-size:12px;color:#475569;word-break:break-all">${verifyUrl}</div>
    </div>
    ${brandBottom}
  `;
  return sendEmail(to, "Verify your CeeBank email", body);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const body = `
    ${brandTop("Welcome to CeeBank")}
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0 0 12px;color:#0b1220;font-size:15px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px;color:#0b1220">Your CeeBank account is ready. You can sign in at
        <a href="https://ceebank.online/login" style="color:#0ea5e9;text-decoration:none">ceebank.online</a>.
      </p>
      <p style="margin:0;color:#334155;font-size:13px">Need help? Reply to this email.</p>
    </div>
    ${brandBottom}
  `;
  return sendEmail(to, "Welcome to CeeBank", body);
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const body = `
    ${brandTop("Reset your password")}
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0 0 12px;color:#0b1220;font-size:15px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px;color:#0b1220">We received a request to reset your CeeBank password.</p>
      <p style="margin:16px 0;color:#0b1220">If this was you, click the button below:</p>
      <p style="margin:20px 0">
        <a href="${resetUrl}"
           style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600">
          Reset my password
        </a>
      </p>
      <p style="margin:16px 0 0;color:#334155;font-size:13px">If the button doesn’t work, copy and paste this link:</p>
      <div style="font-size:12px;color:#475569;word-break:break-all">${resetUrl}</div>
      <p style="margin:16px 0 0;color:#64748b;font-size:13px">If you didn’t request this change, you can safely ignore this email.</p>
    </div>
    ${brandBottom}
  `;
  return sendEmail(to, "Reset your CeeBank password", body);
}

// ---- NEW: Transaction receipt email (for every successful transaction) ----
export interface TransactionEmailPayload {
  to: string;
  name: string;
  email: string;              // user email (for reference)
  accountMasked: string;      // e.g., 0451•••466
  txKind: TxKind;             // human-friendly type above
  amount: number;             // positive number
  description?: string;
  counterparty?: string;      // e.g., GTB-22334455 or Airtel 0803...
  reference?: string;         // bank ref or internal ref
  balanceAfter: number;       // post-transaction balance
  createdAt: number;          // epoch ms
}

export async function sendTransactionReceiptEmail(p: TransactionEmailPayload) {
  const subject = `${p.txKind}: ${formatNaira(p.amount)} — ${p.accountMasked}`;
  const body = `
    ${brandTop("Transaction receipt", subject)}
    <div style="max-width:680px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0 0 12px;color:#0b1220;font-size:15px">Hi ${p.name || "there"},</p>
      <p style="margin:0 0 16px;color:#0b1220">A transaction was completed on your CeeBank account.</p>

      <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;padding:14px 16px;background:#f8fafc">
          <strong style="color:#0b1220">${p.txKind}</strong>
          <strong style="color:#0b1220">${formatNaira(p.amount)}</strong>
        </div>
        <div style="padding:14px 16px;color:#0b1220;font-size:14px;line-height:1.7">
          <div><span style="color:#64748b">When:</span> ${formatDateTime(p.createdAt)}</div>
          <div><span style="color:#64748b">Account:</span> ${p.accountMasked}</div>
          ${p.counterparty ? `<div><span style="color:#64748b">Counterparty:</span> ${p.counterparty}</div>` : ""}
          ${p.reference ? `<div><span style="color:#64748b">Reference:</span> ${p.reference}</div>` : ""}
          ${
            p.description
              ? `<div><span style="color:#64748b">Description:</span> ${escapeHtml(p.description)}</div>`
              : ""
          }
          <div style="margin-top:6px"><span style="color:#64748b">Balance after:</span> <strong>${formatNaira(
            p.balanceAfter
          )}</strong></div>
        </div>
      </div>

      <p style="margin:16px 0 0;color:#334155;font-size:13px">
        You can view transactions anytime on your dashboard:
        <a href="https://ceebank.online/dashboard" style="color:#0ea5e9;text-decoration:none">ceebank.online/dashboard</a>.
      </p>
    </div>
    ${brandBottom}
  `;
  return sendEmail(p.to, subject, body);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function verifySmtp() {
  const transporter = createTransporter();
  await transporter.verify();
  return { ok: true };
}
