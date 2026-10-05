import {db} from './db';
export type Connection={id:string,label:string,token:string,meta_id:string|null,accounts:string|null,error:string|null,checked_at:string|null};
export async function connections(owner:string){return (await db().prepare('SELECT * FROM connections WHERE owner=? ORDER BY label,id').bind(owner).all<Connection>()).results;}
export function publicConnections(rows:Connection[]){return rows.map(c=>({id:c.id,label:c.label,error:c.error,checkedAt:c.checked_at,accountCount:c.accounts===null?null:JSON.parse(c.accounts).length}));}
export function uniqueAccounts(rows:Connection[]){return Array.from(new Map(rows.flatMap(c=>c.accounts?JSON.parse(c.accounts):[]).map((a:any)=>[a.id,a])).values()) as any[];}
export function candidates(rows:Connection[],id:string){return rows.filter(c=>c.accounts===null||JSON.parse(c.accounts).some((a:any)=>a.id===id)).sort((a,b)=>Number(!!a.error)-Number(!!b.error));}
