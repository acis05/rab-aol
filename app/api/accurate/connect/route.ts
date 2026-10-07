import crypto from 'node:crypto';
import { NextRequest,NextResponse } from 'next/server';
import { oauthConfig } from '@/lib/accurate';
export async function GET(req:NextRequest){
  try{
    const {clientId,redirectUri,scopes}=oauthConfig();
    const state=crypto.randomBytes(24).toString('hex');
    const u=new URL('https://account.accurate.id/oauth/authorize');
    u.searchParams.set('client_id',clientId);u.searchParams.set('response_type','code');u.searchParams.set('redirect_uri',redirectUri);if(scopes)u.searchParams.set('scope',scopes);u.searchParams.set('state',state);
    const res=NextResponse.redirect(u);
    res.cookies.set('accurate_oauth_state',state,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:600});
    return res;
  }catch(e){return NextResponse.redirect(new URL(`/integrations/accurate?error=${encodeURIComponent(e instanceof Error?e.message:String(e))}`,process.env.APP_URL||req.nextUrl.origin))}
}
