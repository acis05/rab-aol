import crypto from 'node:crypto';
import { db } from '@/lib/db';

const ACCOUNT = 'https://account.accurate.id';
const COMPANY_KEY = 'default';

function secretKey(){
  const raw = process.env.ACCURATE_TOKEN_ENCRYPTION_KEY || process.env.ACCURATE_CLIENT_SECRET || '';
  if(!raw) throw new Error('ACCURATE_CLIENT_SECRET belum dikonfigurasi');
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptSecret(value:string|null|undefined){
  if(!value) return null;
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',secretKey(),iv);
  const enc=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  const tag=cipher.getAuthTag();
  return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptSecret(value:string|null|undefined){
  if(!value) return null;
  if(!value.startsWith('enc:')) return value; // compatibility with older MVP rows
  const [,ivB64,tagB64,dataB64]=value.split(':');
  const decipher=crypto.createDecipheriv('aes-256-gcm',secretKey(),Buffer.from(ivB64,'base64'));
  decipher.setAuthTag(Buffer.from(tagB64,'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64,'base64')),decipher.final()]).toString('utf8');
}

export function oauthConfig(){
  const clientId=process.env.ACCURATE_CLIENT_ID?.trim();
  const clientSecret=process.env.ACCURATE_CLIENT_SECRET?.trim();
  const redirectUri=process.env.ACCURATE_REDIRECT_URI?.trim();
  if(!clientId||!clientSecret||!redirectUri) throw new Error('ACCURATE_CLIENT_ID, ACCURATE_CLIENT_SECRET, dan ACCURATE_REDIRECT_URI wajib diisi');
  return {clientId,clientSecret,redirectUri,scopes:(process.env.ACCURATE_SCOPES||'item_view customer_view vendor_view').trim()};
}

async function parseResponse(res:Response){
  const text=await res.text();
  let json:any;
  try{json=JSON.parse(text)}catch{throw new Error(`Accurate mengembalikan HTTP ${res.status}: ${text.slice(0,240)}`)}
  if(!res.ok || json?.s===false){
    const msg=Array.isArray(json?.d)?json.d.join('; '):(json?.error_description||json?.error||`HTTP ${res.status}`);
    throw new Error(String(msg));
  }
  return json;
}

export async function exchangeCode(code:string){
  const {clientId,clientSecret,redirectUri}=oauthConfig();
  const body=new URLSearchParams({code,grant_type:'authorization_code',redirect_uri:redirectUri});
  const res=await fetch(`${ACCOUNT}/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
  return parseResponse(res);
}

async function refreshAccessToken(refreshToken:string){
  const {clientId,clientSecret}=oauthConfig();
  const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:refreshToken});
  const res=await fetch(`${ACCOUNT}/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
  return parseResponse(res);
}

export async function saveToken(token:any){
  const expires=token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000):null;
  return db.accurateConnection.upsert({
    where:{companyKey:COMPANY_KEY},
    create:{companyKey:COMPANY_KEY,accessToken:encryptSecret(token.access_token),refreshToken:encryptSecret(token.refresh_token),tokenExpiresAt:expires,scopes:token.scope||null},
    update:{accessToken:encryptSecret(token.access_token),refreshToken:encryptSecret(token.refresh_token),tokenExpiresAt:expires,scopes:token.scope||null,sessionId:null,sessionHost:null,databaseId:null,databaseAlias:null}
  });
}

export async function getConnection(opts:{requireDb?:boolean}={}){
  const row=await db.accurateConnection.findUnique({where:{companyKey:COMPANY_KEY}});
  if(!row?.accessToken) throw new Error('Accurate belum terhubung');
  let accessToken=decryptSecret(row.accessToken)!;
  const refreshToken=decryptSecret(row.refreshToken);
  const nearExpiry=row.tokenExpiresAt && row.tokenExpiresAt.getTime() < Date.now()+24*60*60*1000;
  if(nearExpiry && refreshToken){
    const tok=await refreshAccessToken(refreshToken);
    accessToken=tok.access_token;
    const expires=tok.expires_in?new Date(Date.now()+Number(tok.expires_in)*1000):null;
    await db.accurateConnection.update({where:{companyKey:COMPANY_KEY},data:{accessToken:encryptSecret(tok.access_token),refreshToken:encryptSecret(tok.refresh_token||refreshToken),tokenExpiresAt:expires,scopes:tok.scope||row.scopes}});
  }
  const sessionId=decryptSecret(row.sessionId);
  if(opts.requireDb && (!row.databaseId||!row.sessionHost||!sessionId)) throw new Error('Database Accurate belum dipilih');
  return {...row,accessToken,refreshToken,sessionId};
}

export async function listDatabases(){
  const c=await getConnection();
  const res=await fetch(`${ACCOUNT}/api/db-list.do`,{headers:{Authorization:`Bearer ${c.accessToken}`},cache:'no-store',redirect:'follow'});
  return parseResponse(res);
}

export async function openDatabase(id:string,alias?:string){
  const c=await getConnection();
  const u=new URL(`${ACCOUNT}/api/open-db.do`);u.searchParams.set('id',id);
  const res=await fetch(u,{headers:{Authorization:`Bearer ${c.accessToken}`},cache:'no-store',redirect:'follow'});
  const json=await parseResponse(res);
  if(!json.host||!json.session) throw new Error('Response Open DB tidak memiliki host/session');
  await db.accurateConnection.update({where:{companyKey:COMPANY_KEY},data:{databaseId:id,databaseAlias:alias||null,sessionHost:String(json.host).replace(/\/$/,''),sessionId:encryptSecret(String(json.session))}});
  return json;
}

export async function accurateFetch(path:string, init:RequestInit={}){
  const c=await getConnection({requireDb:true});
  const url=`${String(c.sessionHost).replace(/\/$/,'')}${path.startsWith('/')?path:`/${path}`}`;
  const headers=new Headers(init.headers);
  headers.set('Authorization',`Bearer ${c.accessToken}`);
  headers.set('X-Session-ID',String(c.sessionId));
  const res=await fetch(url,{...init,headers,cache:'no-store',redirect:'follow'});
  return parseResponse(res);
}

export async function listAll(path:string,fields='id,no,name'){
  const rows:any[]=[];
  let page=1;
  for(let guard=0;guard<500;guard++){
    const qs=new URLSearchParams({fields,page:String(page),'sp.pageSize':'100'});
    const j=await accurateFetch(`${path}?${qs.toString()}`);
    if(Array.isArray(j.d)) rows.push(...j.d);
    const pageCount=Number(j?.sp?.pageCount||1);
    if(page>=pageCount) break;
    page++;
  }
  return rows;
}

export async function syncMasters(){
  const now=new Date();
  const result:{entity:string;count:number;error?:string}[]=[];
  const defs=[
    {entity:'Customer',path:process.env.ACCURATE_CUSTOMER_LIST_PATH||'/accurate/api/customer/list.do'},
    {entity:'Vendor',path:process.env.ACCURATE_VENDOR_LIST_PATH||'/accurate/api/vendor/list.do'},
    {entity:'Item',path:process.env.ACCURATE_ITEM_LIST_PATH||'/accurate/api/item/list.do'},
  ] as const;
  for(const def of defs){
    try{
      const rows=await listAll(def.path);
      for(const r of rows){
        const accurateId=String(r.id);
        const code=r.no==null?null:String(r.no);
        const name=String(r.name||r.no||r.id);
        if(def.entity==='Customer') await db.customer.upsert({where:{accurateId},create:{accurateId,code,name,lastSyncedAt:now},update:{code,name,lastSyncedAt:now}});
        if(def.entity==='Vendor') await db.vendor.upsert({where:{accurateId},create:{accurateId,code,name,lastSyncedAt:now},update:{code,name,lastSyncedAt:now}});
        if(def.entity==='Item') await db.item.upsert({where:{accurateId},create:{accurateId,code,name,lastSyncedAt:now},update:{code,name,lastSyncedAt:now}});
      }
      result.push({entity:def.entity,count:rows.length});
    }catch(e){result.push({entity:def.entity,count:0,error:e instanceof Error?e.message:String(e)})}
  }
  const projectPath=process.env.ACCURATE_PROJECT_LIST_PATH?.trim();
  if(projectPath){
    try{
      const rows=await listAll(projectPath);
      let count=0;
      for(const r of rows){
        const accurateId=String(r.id), code=String(r.no||r.code||r.id), name=String(r.name||r.no||r.id);
        const byAcc=await db.project.findUnique({where:{accurateId}});
        if(byAcc){await db.project.update({where:{id:byAcc.id},data:{code,name,lastSyncedAt:now}});count++;continue;}
        const byCode=await db.project.findUnique({where:{code}});
        if(byCode && !byCode.accurateId){await db.project.update({where:{id:byCode.id},data:{accurateId,name,lastSyncedAt:now}});count++;continue;}
        if(!byCode){await db.project.create({data:{accurateId,code,name,lastSyncedAt:now}});count++;}
      }
      result.push({entity:'Project',count});
    }catch(e){result.push({entity:'Project',count:0,error:e instanceof Error?e.message:String(e)})}
  }
  return result;
}

export async function pushProject(projectId:string){
  const path=process.env.ACCURATE_PROJECT_SAVE_PATH?.trim();
  if(!path) throw new Error('ACCURATE_PROJECT_SAVE_PATH belum diisi. Gunakan endpoint Project/Proyek dari API Docs Accurate Anda.');
  const p=await db.project.findUnique({where:{id:projectId}});
  if(!p) throw new Error('Project tidak ditemukan');
  if(p.accurateId) return p;
  const body=new URLSearchParams({name:p.name,no:p.code});
  const j=await accurateFetch(path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  const id=j?.r?.id||j?.d?.id;
  if(!id) throw new Error('Project tersimpan tetapi Accurate ID tidak ditemukan pada response');
  return db.project.update({where:{id:p.id},data:{accurateId:String(id),lastSyncedAt:new Date()}});
}
