import {pages} from './meta';
export function parseTotalSpend(rows:any[],currency:string){
 let amount=0;let since:string|null=null,until:string|null=null;
 for(const r of rows){const n=Number(r.spend);if(r.spend==null||String(r.spend).trim()===''||!Number.isFinite(n)||n<0||r.account_currency!==currency||!/^\d{4}-\d{2}-\d{2}$/.test(r.date_start)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date_stop))throw Error('Meta returned incomplete total spend. Please refresh again.');amount+=n;since=since&&since<r.date_start?since:r.date_start;until=until&&until>r.date_stop?until:r.date_stop;}
 return {amount:Math.round(amount*100)/100,since,until,checkedAt:new Date().toISOString()};
}
export async function totalSpend(id:string,token:string,currency:string){return parseTotalSpend(await pages(id+'/insights',token,{fields:'spend,account_currency,date_start,date_stop',level:'account',time_increment:'all_days',date_preset:'maximum'}),currency);}
