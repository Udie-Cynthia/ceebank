import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const active =
    "bg-black text-white";
  const idle =
    "text-gray-800 hover:bg-gray-200";

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/ceebank-logo.svg" alt="CeeBank" className="h-6 w-6" />
          <span className="text-lg font-semibold">CeeBank</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
          >
            Create account
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
