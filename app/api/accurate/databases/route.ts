import {NextResponse} from 'next/server';import {listDatabases} from '@/lib/accurate';
export async function GET(){try{const j=await listDatabases();return NextResponse.json({databases:Array.isArray(j.d)?j.d:[]})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:400})}}
