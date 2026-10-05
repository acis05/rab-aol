import { NextResponse } from 'next/server'; import { db } from '@/lib/db';
export async function GET(){return NextResponse.json(await db.projectExpense.findMany({include:{project:true,rabItem:true},orderBy:{expenseDate:'desc'}}))}
export async function POST(r:Request){const x=await r.json();return NextResponse.json(await db.projectExpense.create({data:{number:x.number,projectId:x.projectId,rabItemId:x.rabItemId||null,expenseDate:new Date(x.expenseDate),type:x.type||'OTHER',vendorName:x.vendorName,description:x.description,amount:x.amount,status:x.status||'DRAFT'}}),{status:201})}
