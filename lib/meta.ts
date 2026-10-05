export async function graph(path:string,token:string,params:Record<string,string>={}){
 const u=new URL('https://graph.facebook.com/v26.0/'+path);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
 const r=await fetch(u,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(25000)});const j=await r.json() as any;
 if(!r.ok||j.error){const code=j.error?.code;throw new Error(code===190?'Meta token expired or invalid. Connect a new token.':code===10||code===200?'Meta permission is missing for this account.':'Meta could not return this data. Please retry.');}return j;
}
export async function pages(path:string,token:string,params:Record<string,string>){let rows:any[]=[];let after='';for(let i=0;i<100;i++){const j=await graph(path,token,{...params,limit:'100',...(after?{after}:{})});rows.push(...(j.data||[]));if(!j.paging?.next)return rows;const next=j.paging?.cursors?.after;if(!next||next===after)throw Error('Incomplete Meta results. Please retry.');after=next;}throw Error('Too many pages. Results were not saved.');}
export function calculate(campaigns:any[],sets:any[],now=Date.now()){
 let daily=0,lifetime=false,active=0,missing=false;
 for(const c of campaigns){if(c.effective_status!=='ACTIVE')continue;const ss=sets.filter(s=>s.campaign_id===c.id&&s.effective_status==='ACTIVE'&&(!s.start_time||Date.parse(s.start_time)<=now)&&(!s.end_time||Date.parse(s.end_time)>now));if(!ss.length)continue;active++;
 if(Number(c.daily_budget)>0)daily+=Number(c.daily_budget);else if(Number(c.lifetime_budget)>0)lifetime=true;else for(const s of ss){if(Number(s.daily_budget)>0)daily+=Number(s.daily_budget);else if(Number(s.lifetime_budget)>0)lifetime=true;else missing=true;}}
 return {budget:missing||lifetime?null:daily/100,active,budgetNote:lifetime?'Lifetime budget — review separately':missing?'Budget unavailable':''};
}
export function balance(a:any){const s=a.funding_source_details?.display_string||'';const m=s.match(/Available Balance\s*\(₹([\d,]+(?:\.\d+)?)/);return a.currency==='INR'&&m?Number(m[1].replaceAll(',','')):null;}
