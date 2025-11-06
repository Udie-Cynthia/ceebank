export default function About(){
  return (
    <div className="container" style={{padding:'24px 16px 48px'}}>
      <section className="card" style={{padding:'28px 22px', marginTop:16}}>
        <h2 style={{marginTop:0}}>About CeeBank</h2>
        <p style={{color:'var(--muted)'}}>
          <strong>CeeBank</strong> is a modern online banking platform built with a strong focus on reliability,
          security, and clean user experience. It supports account registration with a transaction PIN, sign-in,
          secure transfers, airtime top-ups, bill payments, virtual cards, QR payments, and loans (showcased
          as guided flows in the UI).
        </p>

        <h3>Engineering & Architecture</h3>
        <ul style={{lineHeight:1.7, color:'var(--muted)'}}>
          <li><b>Frontend:</b> React + Vite, routed SPA, optimized assets and caching, reverse-proxied via NGINX.</li>
          <li><b>Backend:</b> Node/Express API with clean routes for auth, account, and transactions.</li>
          <li><b>Security:</b> Account login, per-transfer 4-digit PIN, server-side validation, rate limiting, and
              strict security headers.</li>
          <li><b>Email:</b> Transaction receipts & verification emails. (Switchable SMTP driver: SES / Mailtrap.)</li>
          <li><b>Infra:</b> Dockerized client & server on EC2 behind NGINX, HTTPS via Let’s Encrypt, health checks.</li>
          <li><b>Scripts:</b> CI builds images, EC2 pulls & runs; server logs expose health endpoints for monitoring.</li>
        </ul>

        <h3>Built by</h3>
        <p style={{color:'var(--muted)'}}>
          <b>Cynthia Udie</b> — Developer, DevOps & Cloud Security Engineer. Focused on production-grade
          reliability, secure-by-default configurations, and excellent user experience across platforms.
        </p>

        <div className="footer">
          © 2025 Cynthia Udie. All rights reserved.
        </div>
      </section>
    </div>
  );
}

