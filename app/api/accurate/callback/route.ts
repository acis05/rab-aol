import { NextRequest,NextResponse } from 'next/server';
import { exchangeCode,saveToken } from '@/lib/accurate';
export async function GET(req:NextRequest){
  const base=process.env.APP_URL||req.nextUrl.origin;
  const code=req.nextUrl.searchParams.get('code');
  const err=req.nextUrl.searchParams.get('error');
  const state=req.nextUrl.searchParams.get('state');
  const cookie=req.cookies.get('accurate_oauth_state')?.value;
  if(err) return NextResponse.redirect(new URL(`/integrations/accurate?error=${encodeURIComponent(err)}`,base));
  if(!code) return NextResponse.redirect(new URL('/integrations/accurate?error=Authorization%20code%20tidak%20ada',base));
  if(state && cookie && state!==cookie) return NextResponse.redirect(new URL('/integrations/accurate?error=OAuth%20state%20tidak%20valid',base));
  try{const token=await exchangeCode(code);await saveToken(token);const res=NextResponse.redirect(new URL('/integrations/accurate?connected=1',base));res.cookies.delete('accurate_oauth_state');return res}
  catch(e){return NextResponse.redirect(new URL(`/integrations/accurate?error=${encodeURIComponent(e instanceof Error?e.message:String(e))}`,base))}
}
