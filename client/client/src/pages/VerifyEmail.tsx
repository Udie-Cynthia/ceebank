// client/src/pages/VerifyEmail.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function VerifyEmail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email =
    params.get("email") ||
    localStorage.getItem("email") ||
    sessionStorage.getItem("email") ||
    "";

  return (
    <main className="min-h-[calc(100vh-56px)] bg-gray-50 flex items-center">
      <section className="max-w-lg mx-auto w-full bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src="/ceebank-logo.svg"
            alt="CeeBank"
            className="h-10 w-auto mb-3"
          />
          <h1 className="text-xl font-semibold">Account created</h1>
          <p className="text-gray-600 mt-1">
            We’ve sent a verification email to <span className="font-medium">{email || "your email"}</span>.
            Please check your inbox to complete setup.
          </p>
        </div>

        <div className="mt-6 grid gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 transition"
          >
            Sign in instead
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Didn’t receive the email? Check your spam folder or try again later.
        </p>
      </section>
    </main>
  );
}
