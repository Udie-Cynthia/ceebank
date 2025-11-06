import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="h-12 w-auto" />
          <span className="text-2xl font-semibold text-slate-800 tracking-wide">CeeBank</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link className="text-slate-700 hover:text-sky-600 transition" to="/">Home</Link>
          <Link className="text-slate-700 hover:text-sky-600 transition" to="/about">About</Link>
          <Link className="text-slate-700 hover:text-sky-600 transition" to="/dashboard">Dashboard</Link>
          <Link className="text-slate-700 hover:text-sky-600 transition" to="/transfer">Transfer</Link>
          <Link className="px-3 py-1.5 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition" to="/login">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}

