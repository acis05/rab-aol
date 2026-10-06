import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(){return NextResponse.json(await db.project.findMany({include:{customer:true},orderBy:{code:'asc'}}))}
export async function POST(){return NextResponse.json({error:'Project adalah master read-only dari Accurate Online. Gunakan Sync Accurate.'},{status:405})}
