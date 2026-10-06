import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(){
  return NextResponse.json(await db.project.findMany({include:{customer:true},orderBy:{code:'asc'}}));
}
export async function POST(r:Request){
  const x=await r.json();
  if(!x.code?.trim()||!x.name?.trim()) return NextResponse.json({error:'Kode dan nama project wajib diisi'},{status:400});
  try{
    const row=await db.project.create({data:{code:x.code.trim(),name:x.name.trim(),description:x.description||null,customerId:x.customerId||null,contractValue:Number(x.contractValue||0),status:x.status||'ACTIVE'}});
    return NextResponse.json(row,{status:201});
  }catch(e:any){return NextResponse.json({error:e?.code==='P2002'?'Kode project sudah digunakan':'Gagal membuat project'},{status:400})}
}
export async function PATCH(r:Request){
  const x=await r.json(); if(!x.id)return NextResponse.json({error:'ID wajib'},{status:400});
  const data:any={}; for(const k of ['code','name','description','customerId','status']) if(x[k]!==undefined)data[k]=x[k]||null;
  if(x.contractValue!==undefined)data.contractValue=Number(x.contractValue||0);
  return NextResponse.json(await db.project.update({where:{id:x.id},data}));
}
export async function DELETE(r:Request){
  const id=new URL(r.url).searchParams.get('id'); if(!id)return NextResponse.json({error:'ID wajib'},{status:400});
  const used=await db.project.findUnique({where:{id},select:{_count:{select:{rabHeaders:true,purchases:true,materialIssues:true,expenses:true,materialMoves:true}}}});
  if(!used)return NextResponse.json({error:'Project tidak ditemukan'},{status:404});
  const c=used._count; if(c.rabHeaders+c.purchases+c.materialIssues+c.expenses+c.materialMoves>0)return NextResponse.json({error:'Project sudah dipakai transaksi/RAB dan tidak boleh dihapus. Ubah status menjadi DONE/ON_HOLD.'},{status:409});
  await db.project.delete({where:{id}}); return NextResponse.json({ok:true});
}
