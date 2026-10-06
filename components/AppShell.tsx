import Link from 'next/link';
const groups=[
 ['UTAMA',[['⌂','Dashboard','/'],['▣','Project','/projects']]],
 ['PERENCANAAN',[['▤','RAB / BOQ','/rab'],['↻','Revisi RAB','/rab-revisions']]],
 ['PROCUREMENT',[['⌁','Purchase Request','/procurement/pr'],['▦','Purchase Order','/procurement/po'],['⇩','Penerimaan Barang','/procurement/receipts'],['▧','Invoice Vendor','/procurement/invoices']]],
 ['MATERIAL',[['▥','Stok & Gudang','/materials/stock'],['↗','Material Request','/materials/requests'],['⇢','Material Issue','/materials/issues'],['↩','Material Return','/materials/returns']]],
 ['PROJECT COST',[['Rp','Biaya Proyek','/expenses'],['◫','Cost Control','/cost-control']]],
 ['LAPORAN',[['▥','Budget vs Actual','/reports/budget-actual'],['◒','Material Usage','/reports/material-usage'],['◇','Profitability','/reports/profitability']]],
 ['INTEGRASI',[['A','Accurate Online','/integrations/accurate'],['⚙','Pengaturan','/settings']]],
];
export default function AppShell({children}:{children:React.ReactNode}){return <div className="shell"><aside className="sidebar"><div className="brand"><span className="logo">R</span><span>RAB Control</span></div>{groups.map(([g,items]:any)=><div key={g}><div className="navgroup">{g}</div>{items.map((x:any)=><Link className="navitem" href={x[2]} key={x[2]}><span className="navicon">{x[0]}</span>{x[1]}</Link>)}</div>)}</aside><div className="main"><header className="topbar"><b className="menu-mobile">RAB Control</b><span className="muted">Project Cost Control</span><span className="spacer"/><span className="muted">Indonesia · IDR</span><div className="avatar">AD</div></header>{children}</div></div>}
