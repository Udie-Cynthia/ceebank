// server/src/config/env.ts
// Lightweight environment loader/validator with zero external deps.
// NOTE: We will add dotenv later for loading from .env files during local dev.
// For now, this reads directly from process.env, which works in Docker/ECS.

const toNumber = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: toNumber(process.env.PORT, 4000),

  // Auth (use strong secrets in your private .env for local dev, and in AWS Secrets/SSM for prod)
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? "7d",

  // Database connection string (PostgreSQL via Prisma, later)
  DATABASE_URL: process.env.DATABASE_URL ?? "",
};

// Optional: warn in dev if critical secrets are not set
export function warnIfInsecure() {
  if (env.NODE_ENV !== "production") {
    const weak = [];
    if (env.JWT_ACCESS_SECRET === "change-me-access") weak.push("JWT_ACCESS_SECRET");
    if (env.JWT_REFRESH_SECRET === "change-me-refresh") weak.push("JWT_REFRESH_SECRET");
    if (!env.DATABASE_URL) weak.push("DATABASE_URL");
    if (weak.length) {
      // eslint-disable-next-line no-console
      console.warn(`[env] Using placeholder or missing values: ${weak.join(", ")}`);
    }
  }
}
