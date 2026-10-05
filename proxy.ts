import {NextRequest,NextResponse} from 'next/server';
// Identity and roles are verified at each data entry point.
export function proxy(request:NextRequest){
 if(!['GET','HEAD','OPTIONS'].includes(request.method)){
  if(request.headers.get('origin')!==request.nextUrl.origin||request.headers.get('sec-fetch-site')==='cross-site')return NextResponse.json({error:'Invalid origin'},{status:403});
 }
 const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store');response.headers.set('Referrer-Policy','same-origin');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('X-Frame-Options','DENY');return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
