import { getChatGPTUser } from '@/app/chatgpt-auth';
import { isWorkspaceOwner } from '@/lib/workspace';
import { saveMember, normalizeEmail, LoginError } from '@/lib/vercel-auth';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
const reply = (body: unknown, status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function permitted() { const user = await getChatGPTUser(); return !!user && isWorkspaceOwner(user); }
export async function GET() {
  if (!await permitted()) return reply({error:'Only the owner can manage team access.'},403);
  try { const result=await db().prepare('SELECT email,created_at FROM dashboard_members ORDER BY email').all(); return reply({members:result.results}); }
  catch { return reply({error:'Could not load members. Please retry.'},503); }
}
export async function POST(req: Request) {
  if (!await permitted()) return reply({error:'Only the owner can manage team access.'},403);
  try {
    const body=await req.json() as {action?:string; email?:string; password?:string};
    if(typeof body.email!=='string'||body.email.length>254) return reply({error:'Enter a valid email.'},400);
    if(body.action==='remove') {
      await db().prepare('DELETE FROM dashboard_members WHERE email=?').bind(normalizeEmail(body.email)).run();
    } else if((body.action==='add'||body.action==='reset')&&typeof body.password==='string') {
      await saveMember(body.email,body.password,body.action==='reset');
    } else return reply({error:'Invalid action.'},400);
    return reply({ok:true});
  } catch(error) {return reply({error:error instanceof LoginError?error.message:'Could not save team access. Please retry.'},error instanceof LoginError?error.status:503);}
}
