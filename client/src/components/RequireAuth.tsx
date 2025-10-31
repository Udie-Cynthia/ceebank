// client/src/components/RequireAuth.tsx
// Guards protected routes. If no mock token, redirect to /login.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = { children: React.ReactNode };

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;

  if (!token) {
    // Send unauthenticated users to /login and remember where they wanted to go
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
