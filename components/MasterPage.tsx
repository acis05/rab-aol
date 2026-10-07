'use client';
import {useEffect,useMemo,useState} from 'react';import Page from './Page';
type Row={id:string;accurateId:string;code?:string|null;name:string;lastSyncedAt?:string|null};
export default function MasterPage({title,desc}:{title:string,desc:string}){
 const endpoint=title==='Customer'?'/api/customers':title==='Vendor'?'/api/vendors':'/api/items';
 const [rows,setRows]=useState<Row[]>([]),[q,setQ]=useState(''),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 async function load(){const r=await fetch(endpoint,{cache:'no-store'});setRows(await r.json())}
 useEffect(()=>{load()},[endpoint]);
 async function sync(){setBusy(true);setMsg('');const r=await fetch('/api/accurate/sync',{method:'POST'}),j=await r.json();setBusy(false);if(!r.ok){setMsg(j.error||'Sync gagal');return}setMsg('Sinkronisasi selesai.');await load()}
 const data=useMemo(()=>rows.filter(x=>(`${x.code||''} ${x.name} ${x.accurateId}`).toLowerCase().includes(q.toLowerCase())),[rows,q]);
 return <Page title={title} subtitle={desc}><div className="toolbar"><button className="btn" onClick={sync} disabled={busy}>{busy?'Sinkronisasi...':'↻ Sync dari Accurate Online'}</button><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder={`Cari ${title.toLowerCase()}...`}/><span className="spacer"/><span className="muted">{data.length} data</span></div>{msg&&<div className="notice section">{msg}</div>}<div className="tablewrap section"><table><thead><tr><th>Kode</th><th>Nama</th><th>Accurate ID</th><th>Terakhir Sync</th><th>Status</th></tr></thead><tbody>{data.length?data.map(x=><tr key={x.id}><td>{x.code||'-'}</td><td><b>{x.name}</b></td><td>{x.accurateId}</td><td>{x.lastSyncedAt?new Date(x.lastSyncedAt).toLocaleString('id-ID'):'-'}</td><td><span className="pill green">Accurate ✓</span></td></tr>):<tr><td colSpan={5} className="empty">Belum ada data. Hubungkan Accurate Online lalu klik Sync.</td></tr>}</tbody></table></div></Page>
}
