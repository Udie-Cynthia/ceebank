import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import QuickActions from './components/QuickActions';
import TransferPage from './components/TransferPage';

function Home() {
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Quick actions pages */}
        <Route path="/actions" element={<QuickActions />} />
        <Route path="/airtime" element={<div className="p-6">Airtime – coming soon</div>} />
        <Route path="/bills" element={<div className="p-6">Bills – coming soon</div>} />
        <Route path="/loans" element={<div className="p-6">Loans – coming soon</div>} />
        <Route path="/cards" element={<div className="p-6">Virtual Cards – coming soon</div>} />
        <Route path="/qr" element={<div className="p-6">QR Payments – coming soon</div>} />
        <Route path="/transfer" element={<TransferPage />} />
        {/* Fallback */}
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
