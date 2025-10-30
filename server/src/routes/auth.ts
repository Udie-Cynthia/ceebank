// server/src/routes/auth.ts
// Mock auth routes for CeeBank. We'll wire real JWT + DB later.

import { Router } from "express";

const router = Router();

/**
 * POST /api/auth/register
 * Mock: accepts { email, password, name } and returns a fake user id
 */
router.post("/register", (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing email, password, or name" });
  }
  // In the real version, we'll hash password and insert into Postgres.
  return res.status(201).json({
    id: "user_mock_123",
    email,
    name,
    message: "Registered (mock). Real DB/JWT coming soon.",
  });
});

/**
 * POST /api/auth/login
 * Mock: accepts { email, password } and returns a fake JWT token pair
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  // In the real version, we'll verify password and sign JWTs.
  const accessToken = "mock_access_token";
  const refreshToken = "mock_refresh_token";
  return res.json({
    user: { id: "user_mock_123", email },
    accessToken,
    refreshToken,
    message: "Logged in (mock). Real JWT coming soon.",
  });
});

export default router;
