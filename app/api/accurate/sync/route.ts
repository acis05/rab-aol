import {NextResponse} from 'next/server';import {syncMasters} from '@/lib/accurate';
export async function POST(){try{return NextResponse.json({ok:true,result:await syncMasters()})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:400})}}
