// server/src/utils/mailer.ts
import nodemailer from "nodemailer";

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,
} = process.env;

function boolFrom(val: string | undefined, fallback = false): boolean {
  if (val === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(val.toLowerCase());
}

export function canSend(): boolean {
  return !!(MAIL_HOST && MAIL_USER && MAIL_PASS && MAIL_FROM);
}

function makeTransport() {
  if (!canSend()) {
    throw new Error("SMTP credentials are not fully configured (HOST/USER/PASS).");
  }
  const port = Number(MAIL_PORT || 587);
  const secure = MAIL_SECURE ? boolFrom(MAIL_SECURE) : port === 465;

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port,
    secure,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
}

export async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendResult> {
  try {
    const transporter = makeTransport();
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<SendResult> {
  const subject = "Verify your CeeBank account";
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
    <h2>Hi ${name || "there"}, welcome to CeeBank!</h2>
    <p>Please verify your email address to activate your account.</p>
    <p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 16px;background:#0a7cff;color:#fff;border-radius:6px;text-decoration:none">
        Verify Email
      </a>
    </p>
    <p>If the button doesn't work, copy/paste this link:<br/>
      <span style="word-break:break-all">${verifyUrl}</span>
    </p>
    <p style="color:#6b7280;font-size:12px">If you didn’t request this, you can ignore this email.</p>
  </div>`;
  return sendHtmlEmail(email, subject, html);
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<SendResult> {
  const subject = "Welcome to CeeBank";
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
    <h2>Welcome aboard, ${name || "there"} 🎉</h2>
    <p>Your CeeBank account is ready. You can now sign in and start banking.</p>
    <p>Need help? Just reply to this email.</p>
    <p style="margin-top:24px;color:#6b7280;font-size:12px">© ${new Date().getFullYear()} CeeBank. All rights reserved.</p>
  </div>`;
  return sendHtmlEmail(email, subject, html);
}

export async function sendTxnReceiptEmail(args: {
  to: string;
  name: string;
  amount: number;              // in NGN
  direction: "DEBIT" | "CREDIT";
  balance: number;             // resulting balance
  txnRef: string;
  description?: string;
  toAccount?: string;
  toName?: string;
  when?: string;               // ISO string
}): Promise<SendResult> {
  const {
    to,
    name,
    amount,
    direction,
    balance,
    txnRef,
    description,
    toAccount,
    toName,
    when,
  } = args;

  const sign = direction === "DEBIT" ? "-" : "+";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
  const whenText = when ? new Date(when).toLocaleString() : new Date().toLocaleString();

  const subject =
    direction === "DEBIT"
      ? `Transaction Alert: ${fmt(amount)} debited`
      : `Transaction Alert: ${fmt(amount)} credited`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
    <h2>CeeBank Transaction Alert</h2>
    <p>Hi ${name},</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 0;color:#6b7280">Type</td>
        <td style="padding:6px 0"><strong>${direction}</strong></td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280">Amount</td>
        <td style="padding:6px 0"><strong>${sign}${fmt(amount)}</strong></td>
      </tr>
      ${
        toAccount || toName
          ? `<tr>
               <td style="padding:6px 0;color:#6b7280">Counterparty</td>
               <td style="padding:6px 0">${toName || ""} ${toAccount ? "· " + toAccount : ""}</td>
             </tr>`
          : ""
      }
      ${
        description
          ? `<tr>
               <td style="padding:6px 0;color:#6b7280">Description</td>
               <td style="padding:6px 0">${description}</td>
             </tr>`
          : ""
      }
      <tr>
        <td style="padding:6px 0;color:#6b7280">Date/Time</td>
        <td style="padding:6px 0">${whenText}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280">Reference</td>
        <td style="padding:6px 0">${txnRef}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280">Available Balance</td>
        <td style="padding:6px 0"><strong>${fmt(balance)}</strong></td>
      </tr>
    </table>
    <p style="margin-top:24px;color:#6b7280;font-size:12px">© ${new Date().getFullYear()} CeeBank. All rights reserved.</p>
  </div>`;
  return sendHtmlEmail(to, subject, html);
}
