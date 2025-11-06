import { useNavigate } from "react-router-dom";

export default function QuickActions(){
  const nav = useNavigate();

  const go = (path:string) => () => nav(path);

  const Item = ({icon, title, desc, to}:{icon:string; title:string; desc:string; to:string}) => (
    <div className="qaction card" onClick={go(to)} role="button" tabIndex={0}
         onKeyDown={(e)=> (e.key==='Enter' || e.key===' ') && go(to)()}>
      <div className="qicon">{icon}</div>
      <div>
        <div className="qtitle">{title}</div>
        <div className="qdesc">{desc}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-3">
      <Item icon="📶" title="Buy Airtime" desc="Top up any network instantly."        to="/airtime" />
      <Item icon="💸" title="Transfer"    desc="Send money to banks & wallets."       to="/transfer" />
      <Item icon="📺" title="Pay Bills"   desc="Utility, TV, internet, more."         to="/bills" />
      <Item icon="💳" title="Virtual Cards" desc="Create and manage virtual cards."   to="/cards" />
      <Item icon="🔳" title="QR Payments" desc="Scan & pay at merchants."             to="/qr" />
      <Item icon="🪙" title="Loans"       desc="Quick loans & offers."                to="/loans" />
    </div>
  );
}
