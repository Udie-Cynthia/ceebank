import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import QuickActions from "./components/QuickActions";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import TransferPage from "./components/TransferPage";

function Footer() {
  return (
    <footer className="footer">
      © 2025 Cynthia Ud ie. All rights reserved.
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <QuickActions />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
