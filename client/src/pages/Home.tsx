import { Link } from "react-router-dom";
import QuickActions from "../components/QuickActions";

export default function Home(){
  return (
    <div className="container" style={{padding:'24px 16px 48px'}}>
      <section className="hero card" style={{padding:'32px 24px', marginTop:16}}>
        <h1>Modern banking that just works.</h1>
        <p>Send money, pay bills, buy airtime, get virtual cards, and more — fast and secure.</p>
        <div style={{display:'flex', gap:12, marginTop:6}}>
          <Link to="/register" className="btn brand">Open an account</Link>
          <Link to="/login" className="btn">Sign in</Link>
        </div>
      </section>

      <section style={{marginTop:24}} className="grid grid-3">
        <div className="card">
          <div className="kv"><span className="qicon">₦</span><div>
            <div className="qtitle">Account Balance</div>
            <div className="qdesc">Check your balance after signing in.</div>
          </div></div>
        </div>

        <div className="card">
          <div className="kv"><span className="qicon">⚡</span><div>
            <div className="qtitle">Instant Transfers</div>
            <div className="qdesc">Send to banks & wallets within seconds.</div>
          </div></div>
        </div>

        <div className="card">
          <div className="kv"><span className="qicon">🛡</span><div>
            <div className="qtitle">Secure by design</div>
            <div className="qdesc">Transaction PIN and best-practice security.</div>
          </div></div>
        </div>
      </section>

      <section style={{marginTop:24}} className="card">
        <h3 style={{marginTop:0}}>Quick Actions</h3>
        <QuickActions />
      </section>
    </div>
  );
}
