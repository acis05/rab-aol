import {NextResponse} from 'next/server';import {pushProject} from '@/lib/accurate';
export async function POST(r:Request){try{const x=await r.json();if(!x.projectId)return NextResponse.json({error:'projectId wajib'},{status:400});return NextResponse.json(await pushProject(String(x.projectId)))}catch(e){return NextResponse.json({error:e instanceof Error?e.message:String(e)},{status:400})}}
