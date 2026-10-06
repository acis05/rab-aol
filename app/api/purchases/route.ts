import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PurchaseType, DocStatus } from '@prisma/client';

export async function GET(r:Request){
  const u=new URL(r.url); const type=u.searchParams.get('type') as PurchaseType|null;
  const docs=await db.purchaseDoc.findMany({where:type?{type}:undefined,include:{project:true,vendor:true,lines:{include:{item:true,rabItem:true}}},orderBy:{createdAt:'desc'}});
  return NextResponse.json(docs);
}
export async function POST(r:Request){
  const x=await r.json();
  const doc=await db.purchaseDoc.create({data:{type:x.type,number:x.number,projectId:x.projectId,vendorId:x.vendorId||null,docDate:new Date(x.docDate||Date.now()),status:x.status||'DRAFT',sourceId:x.sourceId||null,notes:x.notes||null,lines:{create:(x.lines||[]).map((l:any)=>({rabItemId:l.rabItemId||null,itemId:l.itemId,description:l.description||'',qty:Number(l.qty),unit:l.unit||null,unitPrice:Number(l.unitPrice||0)}))}},include:{lines:true}});
  return NextResponse.json(doc,{status:201});
}
export async function PATCH(r:Request){const x=await r.json();const d=await db.purchaseDoc.update({where:{id:x.id},data:{status:x.status as DocStatus,notes:x.notes}});return NextResponse.json(d)}
export async function DELETE(r:Request){const id=new URL(r.url).searchParams.get('id');if(!id)return NextResponse.json({error:'id required'},{status:400});await db.purchaseDoc.delete({where:{id}});return NextResponse.json({ok:true})}
