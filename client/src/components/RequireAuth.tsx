import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = { children: React.ReactNode };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken")
  );
}

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

