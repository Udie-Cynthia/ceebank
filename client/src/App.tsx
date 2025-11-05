import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages (make sure these files exist)
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import VerifyEmailPage from "./components/VerifyEmailPage";

// ---- Small helpers ----
function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-gray-600">Page not found</p>
        <a href="/login" className="mt-4 inline-block underline">
          Go to Login
        </a>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;
  if (!email) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ---- App (single default export) ----
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
