// server/src/utils/mailer.ts
// Thin wrapper around nodemailer using Mailtrap SMTP via environment variables.

import nodemailer from "nodemailer";

const {
  MAILTRAP_HOST,
  MAILTRAP_PORT,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  MAIL_FROM = "CeeBank <no-reply@ceebank.online>",
} = process.env;

if (!MAILTRAP_HOST || !MAILTRAP_PORT || !MAILTRAP_USER || !MAILTRAP_PASS) {
  // We don't throw at import time; we'll fail gracefully when sending.
  // This avoids crashing the server if envs are missing during local dev.
  // eslint-disable-next-line no-console
  console.warn("[mailer] Mailtrap SMTP environment variables are not fully set.");
}

export function createTransport() {
  return nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: Number(MAILTRAP_PORT || 587),
    secure: false,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });
}

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  const transporter = createTransport();

  const html = `
  <div style="font-family:system-ui,Segoe UI,Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <img src="https://ceebank.online/ceebank-logo.svg" alt="CeeBank" style="height:36px"/>
      <span style="font-weight:700;font-size:18px">CeeBank</span>
    </div>

    <h2 style="margin:16px 0 8px 0;">Welcome to CeeBank, ${escapeHtml(
      opts.name || "there"
    )}!</h2>
    <p style="margin:8px 0 18px 0;line-height:1.6">
      We’re excited to have you. Please verify your email address to activate your account.
    </p>

    <div style="margin:18px 0;">
      <a href="${opts.verifyUrl}"
         style="display:inline-block;background:#2563eb;color:white;text-decoration:none;
                padding:12px 18px;border-radius:10px;font-weight:600">
        Verify my email
      </a>
    </div>

    <p style="color:#475569;font-size:14px;line-height:1.6">
      Or copy and paste this link into your browser:<br/>
      <span style="word-break:break-all;color:#0ea5e9">${opts.verifyUrl}</span>
    </p>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>

    <p style="color:#64748b;font-size:12px;margin:0">
      If you did not create an account, you can safely ignore this email.
    </p>
    <p style="color:#64748b;font-size:12px;margin:6px 0 0 0">
      © All Rights Reserved – 2025 • CeeBank
    </p>
  </div>`;

  const result = await transporter.sendMail({
    from: MAIL_FROM,
    to: opts.to,
    subject: "Welcome to CeeBank — verify your email",
    html,
  });

  return { messageId: result.messageId };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return c;
    }
  });
}
