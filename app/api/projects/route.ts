import { NextResponse } from 'next/server'; import { db } from '@/lib/db';
export async function GET(){return NextResponse.json(await db.project.findMany({orderBy:{createdAt:'desc'}}))}
export async function POST(r:Request){const x=await r.json();const p=await db.project.create({data:{code:x.code,name:x.name,customerName:x.customerName,contractValue:x.contractValue||0}});return NextResponse.json(p,{status:201})}
