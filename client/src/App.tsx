import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import QuickActions from "./components/QuickActions";
import Home from "./pages/Home";
import About from "./pages/About";

// Placeholder pages for quick action routes (you can style later)
function Placeholder({title}:{title:string}){
  return (
    <div className="container" style={{padding:'24px 16px'}}>
      <div className="card" style={{padding:'28px'}}>
        <h2 style={{marginTop:0}}>{title}</h2>
        <p style={{color:'var(--muted)'}}>This page will guide the full flow soon.</p>
      </div>
    </div>
  );
}

function Dashboard(){
  // very light dashboard shell
  return (
    <div className="container" style={{padding:'24px 16px'}}>
      <div className="card" style={{padding:'24px'}}>
        <h2 style={{marginTop:0}}>Dashboard</h2>
        <p style={{color:'var(--muted)'}}>Welcome back. Use the quick actions below to get things done.</p>
      </div>
      <div style={{marginTop:16}} className="card">
        <h3 style={{marginTop:0}}>Quick Actions</h3>
        <QuickActions />
      </div>
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard/>} />

        <Route path="/airtime" element={<Placeholder title="Buy Airtime" />} />
        <Route path="/transfer" element={<Placeholder title="Transfer" />} />
        <Route path="/bills" element={<Placeholder title="Pay Bills" />} />
        <Route path="/cards" element={<Placeholder title="Virtual Cards" />} />
        <Route path="/qr" element={<Placeholder title="QR Payments" />} />
        <Route path="/loans" element={<Placeholder title="Loans" />} />

        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
      <div className="container footer">© 2025 Cynthia Ud ie. All rights reserved.</div>
    </BrowserRouter>
  );
}
