import { NextRequest, NextResponse } from 'next/server';
import { authorized } from './lib/vercel-auth';
export function proxy(request: NextRequest) {
  if (!process.env.DASHBOARD_EMAIL || !process.env.DASHBOARD_PASSWORD || process.env.DASHBOARD_PASSWORD.length < 16) {
    return new NextResponse('Dashboard login is not configured.', { status: 503 });
  }
  if (!authorized(request.headers.get('authorization'))) {
    return new NextResponse('Sign in to Fund Desk.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Fund Desk", charset="UTF-8"', 'Cache-Control': 'no-store' } });
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) return new NextResponse('Invalid origin', { status: 403 });
    if (request.headers.get('sec-fetch-site') === 'cross-site') return new NextResponse('Invalid origin', { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'] };
