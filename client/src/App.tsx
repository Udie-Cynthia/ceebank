import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import QuickActions from "./components/QuickActions"; // only used inside Dashboard, but safe to keep
import Home from "./pages/Home";
import About from "./pages/About";
import TransferPage from "./components/TransferPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-[calc(100vh-56px)] bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Dashboard includes QuickActions internally */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Other pages can later be implemented; for now they can be placeholders */}
          <Route path="/transfer" element={<TransferPage />}
          <Route path="/airtime" element={<div className="max-w-6xl mx-auto px-4 py-6">Airtime</div>} />
          <Route path="/bills" element={<div className="max-w-6xl mx-auto px-4 py-6">Bills</div>} />
          <Route path="/loans" element={<div className="max-w-6xl mx-auto px-4 py-6">Loans</div>} />
          <Route path="/cards" element={<div className="max-w-6xl mx-auto px-4 py-6">Virtual Cards</div>} />
          <Route path="/qr" element={<div className="max-w-6xl mx-auto px-4 py-6">QR Payments</div>} />

          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
