import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="h-6 w-6" />
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive}) => isActive ? "font-medium" : "text-gray-600 hover:text-gray-900"}>Home</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? "font-medium" : "text-gray-600 hover:text-gray-900"}>About</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "font-medium" : "text-gray-600 hover:text-gray-900"}>Dashboard</NavLink>
          <NavLink to="/transfer" className={({isActive}) => isActive ? "font-medium" : "text-gray-600 hover:text-gray-900"}>Transfer</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? "font-medium" : "text-gray-600 hover:text-gray-900"}>Sign in</NavLink>
        </div>
      </nav>
    </header>
  );
}


