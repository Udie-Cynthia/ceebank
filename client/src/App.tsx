import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import TransferPage from './components/TransferPage';

function TopNav() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        <Link to="/" className="font-semibold">CeeBank</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/">Dashboard</Link>
          <Link to="/transfer">Transfer</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} CeeBank
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <main className="min-h-[calc(100vh-140px)] bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
