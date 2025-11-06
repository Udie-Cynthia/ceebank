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
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/transfer" element={<TransferPage />} />
      <Route path="/airtime" element={<AirtimePage />} />
      <Route path="/bills" element={<BillsPage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="/cards" element={<CardsPage />} />
      <Route path="/qr" element={<QRPage />} />
      </Routes>
    </BrowserRouter>
  );
}
