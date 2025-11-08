// client/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./components/Dashboard";
import TransferPage from "./components/TransferPage";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-[calc(100vh-56px)] bg-gray-50">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          {/* App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<TransferPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// ci: trigger 2025-11-08T13:37:14.8458894+01:00
