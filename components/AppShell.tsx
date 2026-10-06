import Link from 'next/link';
const groups=[
 ['UTAMA',[['⌂','Dashboard','/'],['▣','RAB Proyek','/rab']]],
 ['MASTER ACCURATE',[['P','Project','/master/projects'],['C','Customer','/master/customers'],['V','Vendor','/master/vendors'],['I','Item','/master/items']]],
 ['TRANSAKSI',[['⇢','Pemakaian Material','/materials/issues'],['Rp','Biaya Proyek','/expenses']]],
 ['KONTROL',[['◫','Cost Control','/cost-control'],['▥','Budget vs Actual','/reports/budget-actual'],['◒','Material Usage','/reports/material-usage'],['◇','Profitability','/reports/profitability']]],
 ['INTEGRASI',[['A','Accurate Online','/integrations/accurate'],['⚙','Pengaturan','/settings']]],
];
export default function AppShell({children}:{children:React.ReactNode}){return <div className="shell"><aside className="sidebar"><div className="brand"><span className="logo">R</span><span>RAB Control</span></div>{groups.map(([g,items]:any)=><div key={g}><div className="navgroup">{g}</div>{items.map((x:any)=><Link className="navitem" href={x[2]} key={x[2]}><span className="navicon">{x[0]}</span>{x[1]}</Link>)}</div>)}</aside><div className="main"><header className="topbar"><b className="menu-mobile">RAB Control</b><span className="muted">RAB + Accurate Online</span><span className="spacer"/><span className="muted">Master data dikelola di Accurate</span><div className="avatar">AD</div></header>{children}</div></div>}
