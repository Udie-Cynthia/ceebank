import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import QuickActions from './components/QuickActions';
import TransferPage from './components/TransferPage';
import AirtimePage from "./components/AirtimePage";
import BillsPage from "./components/BillsPage";
import LoansPage from "./components/LoansPage";
import CardsPage from "./components/CardsPage";
import QRPage from "./components/QRPage";

function Home() {
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfer" element={<TransferPage />} />
        {/* Optional placeholders: */}
        <Route path="/airtime" element={<div className="p-6">Airtime — coming soon</div>} />
        <Route path="/bills" element={<div className="p-6">Bills — coming soon</div>} />
        <Route path="/loans" element={<div className="p-6">Loans — coming soon</div>} />
        <Route path="/cards" element={<div className="p-6">Virtual Cards — coming soon</div>} />
        <Route path="/qr" element={<div className="p-6">QR Payments — coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}
