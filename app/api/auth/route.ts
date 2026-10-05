import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { signIn, signOut, sessionCookie, sessionSeconds, LoginError } from '@/lib/vercel-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    if (Number(req.headers.get('content-length') || 0) > 4096) return NextResponse.json({error:'Request too large.'},{status:413});
    const body = await req.json() as {action?:string; email?:string; password?:string};
    const jar = await cookies();
    if (body.action === 'logout') {
      await signOut(jar.get(sessionCookie)?.value);
      jar.set(sessionCookie, '', {httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:0});
      return NextResponse.json({ok:true});
    }
    if (body.action !== 'login' || typeof body.email !== 'string' || typeof body.password !== 'string' || body.email.length>254 || body.password.length>256) return NextResponse.json({error:'Enter your email and password.'},{status:400});
    const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const token = await signIn(body.email, body.password, ip);
    jar.set(sessionCookie, token, {httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:sessionSeconds});
    return NextResponse.json({ok:true});
  } catch (error) {
    return NextResponse.json({error:error instanceof LoginError ? error.message : 'Sign-in is temporarily unavailable. Please retry.'}, {status:error instanceof LoginError ? error.status : 503});
  }
}
