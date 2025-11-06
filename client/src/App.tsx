import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";

/* Existing pages you already have */
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import TransferPage from "./components/TransferPage";

/* Minimal placeholder pages for quick actions */
function Placeholder({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-gray-600">Demo page — feature wiring in progress.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Top-level routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        {/* App */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfer" element={<TransferPage />} />

        {/* Quick actions destinations */}
        <Route path="/airtime" element={<Placeholder title="Buy Airtime" />} />
        <Route path="/pay-bills" element={<Placeholder title="Pay Bills" />} />
        <Route path="/loans" element={<Placeholder title="Loans" />} />
        <Route path="/cards" element={<Placeholder title="Virtual Cards" />} />
        <Route path="/qr" element={<Placeholder title="QR Payments" />} />

        {/* Catch-all → Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
