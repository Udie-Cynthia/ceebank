import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if(!agree){ setErr("You must accept the Terms and Privacy Policy."); return; }
    try{
      const base = (import.meta as any).env?.VITE_API_BASE || "/api";
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password, name, pin })
      });
      if(!res.ok){ setErr(`Registration failed: HTTP ${res.status}`); return; }
      const data = await res.json();
      if(!data?.ok){ setErr(data?.error || "Registration failed"); return; }
      nav("/login");
    }catch(ex:any){
      setErr(ex?.message || "Network error");
    }
  };

  return (
    <div className="container" style={{padding:'32px 16px'}}>
      <form className="card" onSubmit={onSubmit} style={{maxWidth:560, margin:'20px auto'}}>
        <h2 style={{marginTop:0}}>Create your account</h2>
        <div className="grid" style={{gap:12}}>
          <label>Full name
            <input value={name} onChange={e=>setName(e.target.value)} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>
          <label>Email
            <input value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>
          <label>Password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>
          <label>4-digit transaction PIN
            <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} maxLength={4} required
              style={{width:'100%',marginTop:6,padding:'10px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}/>
          </label>

          <div className="checkline" style={{marginTop:6}}>
            <input id="agree" type="checkbox" checked={agree} onChange={()=>setAgree(a=>!a)} />
            <label htmlFor="agree">
              By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </label>
          </div>

          {err && <div style={{color:'#fca5a5', fontWeight:600}}>{err}</div>}

          <div style={{display:'flex', gap:12, marginTop:6}}>
            <button className="btn brand" type="submit">Create account</button>
            <button className="btn" type="button" onClick={()=>history.back()}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
