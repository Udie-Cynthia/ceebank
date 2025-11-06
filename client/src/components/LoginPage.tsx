import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try{
      const base = (import.meta as any).env?.VITE_API_BASE || "/api";
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
      });
      if(!res.ok){
        setErr(`Login failed: HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if(!data?.ok){
        setErr(data?.error || "Login failed");
        return;
      }
      // store a simple flag; your app can replace with real tokens later
      sessionStorage.setItem("ceebank_user", email);
      nav("/dashboard");
    }catch(ex:any){
      setErr(ex?.message || "Network error");
    }
  };

  return (
    <div className="container" style={{padding:'32px 16px'}}>
      <form className="card" onSubmit={onSubmit} style={{maxWidth:440, margin:'20px auto'}}>
        <h2 style={{marginTop:0}}>Welcome back</h2>
        <div style={{display:'grid', gap:12}}>
          <label>Email
            <input value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>
          <label>Password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>

          <div className="checkline">
            <input id="stay" type="checkbox" checked={stay} onChange={()=>setStay(s=>!s)} />
            <label htmlFor="stay">Stay signed in for 30 days</label>
          </div>

          {err && <div style={{color:'#fca5a5', fontWeight:600}}>{err}</div>}

          <button className="btn brand" type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
