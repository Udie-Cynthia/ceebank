import { Link, NavLink } from "react-router-dom";

const linkBase = "px-3 py-2 rounded-md text-sm font-medium transition";
const linkInactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
const linkActive = "text-blue-700 bg-blue-50";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="h-7 w-auto" />
          <span className="sr-only">CeeBank</span>
        </Link>

        {/* Primary nav */}
        <ul className="flex items-center gap-1">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/transfer"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Transfer
            </NavLink>
          </li>
        </ul>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Create Account
          </Link>
        </div>
      </nav>
    </header>
  );
}

