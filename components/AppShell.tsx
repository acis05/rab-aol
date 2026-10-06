'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
const groups=[
 ['UTAMA',[['⌂','Dashboard','/'],['▣','RAB Proyek','/rab']]],
 ['MASTER ACCURATE',[['P','Project','/master/projects'],['C','Customer','/master/customers'],['V','Vendor','/master/vendors'],['I','Item','/master/items']]],
 ['TRANSAKSI',[['⇢','Pemakaian Material','/materials/issues'],['Rp','Biaya Proyek','/expenses']]],
 ['KONTROL',[['◫','Cost Control','/cost-control'],['▥','Budget vs Actual','/reports/budget-actual'],['◒','Material Usage','/reports/material-usage'],['◇','Profitability','/reports/profitability']]],
 ['INTEGRASI',[['A','Accurate Online','/integrations/accurate'],['⚙','Pengaturan','/settings']]],
];
export default function AppShell({children}:{children:React.ReactNode}){
 const [open,setOpen]=useState(false); const path=usePathname();
 const nav=<><div className="brand"><span className="logo">R</span><span>RAB Control</span><button className="navclose" onClick={()=>setOpen(false)}>×</button></div>{groups.map(([g,items]:any)=><div key={g}><div className="navgroup">{g}</div>{items.map((x:any)=><Link onClick={()=>setOpen(false)} className={`navitem ${path===x[2]?'active':''}`} href={x[2]} key={x[2]}><span className="navicon">{x[0]}</span>{x[1]}</Link>)}</div>)}</>;
 return <div className="shell"><aside className="sidebar">{nav}</aside>{open&&<div className="backdrop" onClick={()=>setOpen(false)}/>}<aside className={`mobile-drawer ${open?'open':''}`}>{nav}</aside><div className="main"><header className="topbar"><button className="hamburger" aria-label="Buka menu" onClick={()=>setOpen(true)}>☰</button><b className="menu-mobile">RAB Control</b><span className="muted top-caption">RAB + Accurate Online</span><span className="spacer"/><span className="muted master-caption">Master data dikelola di Accurate</span><div className="avatar">AD</div></header>{children}</div></div>
}
