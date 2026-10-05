import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({configured:Boolean(process.env.ACCURATE_CLIENT_ID&&process.env.ACCURATE_CLIENT_SECRET),oauth:'authorization_code',note:'OAuth connect/callback sengaja belum mengirim transaksi sampai scope & endpoint Accurate final dikonfirmasi.'})}
