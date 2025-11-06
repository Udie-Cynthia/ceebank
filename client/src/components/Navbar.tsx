import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/ceebank-logo.svg" alt="CeeBank" className="logo" />
        <span className="brand">CeeBank</span>
      </Link>

      <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
        <NavLink to="/" style={({isActive}) => ({ color: isActive ? "var(--primary-2)" : "var(--ink)" })}>Home</NavLink>
        <NavLink to="/transfer" style={({isActive}) => ({ color: isActive ? "var(--primary-2)" : "var(--ink)" })}>Transfer</NavLink>
        <NavLink to="/about" style={({isActive}) => ({ color: isActive ? "var(--primary-2)" : "var(--ink)" })}>About</NavLink>
        <NavLink to="/login" style={({isActive}) => ({ color: isActive ? "var(--primary-2)" : "var(--ink)" })}>Login</NavLink>
      </nav>
    </header>
  );
}
