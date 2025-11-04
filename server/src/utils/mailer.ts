/**
 * utils/mailer.ts
 * A resilient mail helper:
 * - If SMTP env is fully configured, uses Nodemailer (SES SMTP).
 * - If not, falls back to a console "sender" but always returns ok: true
 *   so API routes never 500 during demos.
 */

import nodemailer from "nodemailer";

// Read once at startup
const MAIL_HOST = process.env.MAIL_HOST || "";
const MAIL_PORT = Number(process.env.MAIL_PORT || "587");
const MAIL_SECURE = String(process.env.MAIL_SECURE || "false").toLowerCase() === "true";
const MAIL_USER = process.env.MAIL_USER || "";
const MAIL_PASS = process.env.MAIL_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || "CeeBank <no-reply@ceebank.online>";

/** True if all required SMTP vars are present */
export const isSmtpReady = (): boolean =>
  Boolean(MAIL_HOST && MAIL_USER && MAIL_PASS && MAIL_FROM);

/** Create a real transporter (SES SMTP) */
function createSmtpTransport() {
  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE, // false for STARTTLS on 587
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
}

/** Fallback "transporter" that just logs and pretends success */
const consoleTransport = {
  async sendMail(opts: any) {
    const id = `console-${Date.now()}`;
    // Keep logs short but clear
    const preview = {
      from: opts?.from,
      to: opts?.to,
      subject: opts?.subject,
    };
    // eslint-disable-next-line no-console
    console.log("[mailer:console] Simulated send", preview);
    return { messageId: id, simulated: true };
  },
};

const transporter = isSmtpReady() ? createSmtpTransport() : (consoleTransport as any);

type SendResult =
  | { ok: true; messageId: string; simulated?: boolean }
  | { ok: false; error: string };

/** Generic send */
async function send(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    });
    const simulated = Boolean((info as any)?.simulated);
    const messageId: string = (info as any)?.messageId || `unknown-${Date.now()}`;
    return { ok: true, messageId, simulated };
  } catch (err: any) {
    const msg = err?.message || "Unknown mail error";
    return { ok: false, error: msg };
  }
}

/** Helpers */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function fmtAmount(amt: number): string {
  // Always show ₦ with thousands separators
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amt);
  } catch {
    // Fallback (no Intl issue at runtime)
    const s = amt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `₦${s}`;
  }
}

/* ---------------- Polished Templates ---------------- */

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body { background:#0b1020; margin:0; padding:24px; font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#e6eaf2; }
    .card { max-width:640px; margin:0 auto; background:#121a35; border:1px solid #1f2b57; border-radius:16px; overflow:hidden; }
    .header { padding:20px 24px; display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#1a2a6c 0%, #2a4365 100%); }
    .logo { width:32px; height:32px; border-radius:8px; background:#00e6a4; display:inline-block; }
    h1 { margin:0; font-size:18px; color:#fff; }
    .content { padding:24px; line-height:1.6; }
    .cta { display:inline-block; padding:12px 18px; background:#00e6a4; color:#081223 !important; text-decoration:none; border-radius:10px; font-weight:600; }
    .muted { color:#93a4bf; font-size:13px; }
    .hr { height:1px; background:#1f2b57; border:0; margin:20px 0; }
    .list { padding:0; margin:0; list-style:none; color:#cfe1ff; }
    .list li { margin:6px 0; }
    .mono { font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; color:#cfe1ff; }
    .footer { padding:16px 24px; background:#0f172a; color:#93a4bf; font-size:12px; }
    a { color:#00e6a4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="logo"></span>
      <h1>CeeBank</h1>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      © 2025 CeeBank — All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Verification Email */
export async function sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<SendResult> {
  const title = "Verify your CeeBank account";
  const html = layout(
    title,
    `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Welcome to <strong>CeeBank</strong> — your secure, modern digital banking platform.</p>
      <p>Please confirm your email address to activate your account:</p>
      <p><a class="cta" href="${verifyUrl}" target="_blank" rel="noopener">Verify my account</a></p>
      <p class="muted">If you didn’t sign up, you can safely ignore this email.</p>
      <hr class="hr"/>
      <p class="muted">Link not working? Copy &amp; paste: <span class="mono">${escapeHtml(verifyUrl)}</span></p>
    `
  );
  return send({ to, subject: title, html });
}

/* Welcome Email */
export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const title = "Welcome to CeeBank";
  const html = layout(
    title,
    `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Your CeeBank account is now active. You can log in, view balances, send transfers, pay bills, and more.</p>
      <ul class="list">
        <li>24/7 access to your money</li>
        <li>Secure transfers with a 4-digit PIN</li>
        <li>Real-time transaction emails</li>
      </ul>
      <p class="muted">Need help? Reply to this email — we’ve got you.</p>
    `
  );
  return send({ to, subject: title, html });
}

/* Transaction Receipt */
export async function sendTxnReceiptEmail(opts: {
  to: string;
  name: string;
  type: "transfer" | "airtime" | "bill" | "loan" | "card" | "qr" | "deposit";
  amount: number;
  reference: string;
  timestampISO: string;
  balanceAfter: number;
  note?: string;
  counterparty?: string;
}): Promise<SendResult> {
  const title = `Transaction receipt — ${opts.type}`;
  const html = layout(
    title,
    `
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>Your <strong>${escapeHtml(opts.type)}</strong> has been processed successfully.</p>
      <ul class="list">
        <li><strong>Amount:</strong> ${fmtAmount(opts.amount)}</li>
        <li><strong>Reference:</strong> <span class="mono">${escapeHtml(opts.reference)}</span></li>
        <li><strong>Date:</strong> ${new Date(opts.timestampISO).toLocaleString("en-NG")}</li>
        <li><strong>Balance after:</strong> ${fmtAmount(opts.balanceAfter)}</li>
        ${opts.counterparty ? `<li><strong>Counterparty:</strong> ${escapeHtml(opts.counterparty)}</li>` : ""}
        ${opts.note ? `<li><strong>Note:</strong> ${escapeHtml(opts.note)}</li>` : ""}
      </ul>
      <p class="muted">If you didn’t make this transaction, contact support immediately.</p>
    `
  );
  return send({ to: opts.to, subject: title, html });
}
