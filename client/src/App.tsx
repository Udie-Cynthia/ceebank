import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./components/Dashboard";
import TransferPage from "./components/TransferPage";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register"; // <-- ensure this file exists and exports default

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      {/* Page container */}
      <main className="min-h-[calc(100vh-56px)] bg-gray-50">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />   {/* <-- Create Account route */}

          {/* App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<TransferPage />} />

          {/* Optional simple placeholders (safe to keep or remove) */}
          {/* <Route path="/airtime" element={<div className="max-w-6xl mx-auto px-4 py-6">Airtime</div>} /> */}
          {/* <Route path="/bills" element={<div className="max-w-6xl mx-auto px-4 py-6">Bills</div>} /> */}
          {/* <Route path="/loans" element={<div className="max-w-6xl mx-auto px-4 py-6">Loans</div>} /> */}
          {/* <Route path="/cards" element={<div className="max-w-6xl mx-auto px-4 py-6">Virtual Cards</div>} /> */}
          {/* <Route path="/qr" element={<div className="max-w-6xl mx-auto px-4 py-6">QR Payments</div>} /> */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}
