// src/utils/mailer.ts
// Centralized email sending for CeeBank using SES SMTP envs.
// Exposes helpers: sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, verifySmtp.

import nodemailer from "nodemailer";

type MailResult = { ok: boolean; messageId?: string; error?: string };

const {
  MAILTRAP_HOST = "",
  MAILTRAP_PORT = "587",
  MAILTRAP_USER = "",
  MAILTRAP_PASS = "",
  MAIL_FROM = "CeeBank <hello@ceebank.online>",
} = process.env;

/**
 * Create a nodemailer transport using generic SMTP (mapped to SES via envs).
 * Port 465 => secure TLS; otherwise STARTTLS.
 */
function makeTransport() {
  const portNum = parseInt(MAILTRAP_PORT, 10) || 587;
  const secure = portNum === 465;

  if (!MAILTRAP_HOST || !MAILTRAP_USER || !MAILTRAP_PASS) {
    throw new Error("SMTP is not configured. Check MAILTRAP_* env vars.");
  }

  return nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: portNum,
    secure,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });
}

/** Core send helper */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<MailResult> {
  try {
    const transporter = makeTransport();

    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, " "),
      html,
    });

    return { ok: true, messageId: info.messageId };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || "Failed to send email",
    };
  }
}

/* ---------------- Email Templates (polished, production tone) ---------------- */

function brandHeader() {
  return `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:24px;font-weight:700;color:#0e7490">CeeBank</div>
    </div>
  `;
}

function baseShell(inner: string) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto;padding:24px">
      ${brandHeader()}
      ${inner}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      <p style="font-size:12px;color:#94a3b8">© 2025 CeeBank. All rights reserved.</p>
    </div>
  `;
}

function verificationTemplate(name: string, verifyUrl: string) {
  const safeName = name?.trim() || "there";
  return {
    subject: "Verify your CeeBank account",
    html: baseShell(`
      <h2 style="margin:0 0 8px 0;color:#0f172a">Hi ${safeName}, please verify your email</h2>
      <p style="margin:0 0 16px 0;color:#334155">
        For your security, confirm your email address to activate your account.
      </p>
      <p style="text-align:center;margin:24px 0">
        <a href="${verifyUrl}"
           style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
          Verify my email
        </a>
      </p>
      <p style="font-size:12px;color:#64748b">
        If the button doesn’t work, copy and paste this link into your browser:<br/>
        <span style="word-break:break-all">${verifyUrl}</span>
      </p>
    `),
  };
}

function welcomeTemplate(name: string) {
  const safeName = name?.trim() || "there";
  return {
    subject: "Welcome to CeeBank",
    html: baseShell(`
      <h2 style="margin:0 0 8px 0;color:#0f172a">Hello ${safeName}, your account is ready</h2>
      <p style="margin:0 0 12px 0;color:#334155">
        Thank you for choosing CeeBank. You can sign in to manage your accounts,
        send transfers, pay bills, and more—securely from anywhere.
      </p>
      <ul style="margin:0 0 16px 18px;color:#334155">
        <li>Secure sign-in and session protection</li>
        <li>Fast transfers and clear transaction history</li>
        <li>Modern, responsive experience across devices</li>
      </ul>
      <p style="text-align:center;margin:24px 0">
        <a href="https://ceebank.online/login"
           style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
          Go to Login
        </a>
      </p>
    `),
  };
}

function passwordResetTemplate(name: string, resetUrl: string, code?: string) {
  const safeName = name?.trim() || "there";
  return {
    subject: "Reset your CeeBank password",
    html: baseShell(`
      <h2 style="margin:0 0 8px 0;color:#0f172a">Hi ${safeName}, reset your password</h2>
      <p style="margin:0 0 12px 0;color:#334155">
        Click the button below to choose a new password. If you didn’t request this, ignore this message.
      </p>
      <p style="text-align:center;margin:24px 0">
        <a href="${resetUrl}"
           style="background:#0ea5e9;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
          Reset password
        </a>
      </p>
      ${
        code
          ? `<p style="font-size:13px;color:#334155;text-align:center">Or use this one-time code: <b>${code}</b></p>`
          : ""
      }
      <p style="font-size:12px;color:#64748b">
        For your security, this link may expire.
      </p>
    `),
  };
}

/* ---------------- Public helpers ---------------- */

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<MailResult> {
  const t = verificationTemplate(name, verifyUrl);
  return sendEmail(email, t.subject, t.html);
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<MailResult> {
  const t = welcomeTemplate(name);
  return sendEmail(email, t.subject, t.html);
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string,
  code?: string
): Promise<MailResult> {
  const t = passwordResetTemplate(name, resetUrl, code);
  return sendEmail(email, t.subject, t.html);
}

/** Quick SMTP verification (used by /api/debug/smtp) */
export async function verifySmtp(): Promise<{
  ok: boolean;
  host: string;
  port: number;
  secure: boolean;
  message?: string;
  error?: string;
}> {
  const portNum = parseInt(MAILTRAP_PORT, 10) || 587;
  const secure = portNum === 465;

  try {
    const transporter = makeTransport();
    await transporter.verify();
    return { ok: true, host: MAILTRAP_HOST, port: portNum, secure, message: "SMTP ready" };
  } catch (err: any) {
    return {
      ok: false,
      host: MAILTRAP_HOST,
      port: portNum,
      secure,
      error: err?.message || "SMTP verify failed",
    };
  }
}
