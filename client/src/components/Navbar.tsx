import { Link, useLocation } from "react-router-dom";

export default function Navbar(){
  const { pathname } = useLocation();
  const isActive = (p:string) => pathname === p;

  return (
    <nav className="navbar">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/ceebank-logo.svg" alt="CeeBank" width={30} height={30} />
          <strong style={{letterSpacing:.3}}>CeeBank</strong>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <Link to="/" style={{opacity:isActive('/')?1:.8, fontWeight:isActive('/')?700:500}}>Home</Link>
          <Link to="/about" style={{opacity:isActive('/about')?1:.8, fontWeight:isActive('/about')?700:500}}>About</Link>
          <Link to="/login" className="btn">Sign in</Link>
          <Link to="/register" className="btn brand">Create account</Link>
        </div>
      </div>
    </nav>
  );
}
