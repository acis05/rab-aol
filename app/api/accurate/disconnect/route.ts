import {NextResponse} from 'next/server';import {db} from '@/lib/db';
export async function POST(){await db.accurateConnection.deleteMany({where:{companyKey:'default'}});return NextResponse.json({ok:true})}
