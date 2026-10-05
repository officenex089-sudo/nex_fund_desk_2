// Do not render HTML gateway/sign-in responses or raw parser exceptions as data.
export async function readApiResponse(r:Response):Promise<any>{
 if(r.status===401||r.status===403||r.redirected&&/signin|login|authorize/.test(r.url))throw Error('Your session needs attention. Reload the dashboard and sign in again.');
 if(!r.headers.get('content-type')?.includes('application/json'))throw Error('The server did not return account data. Please retry shortly; if this continues, reload and sign in again.');
 let data:any;try{data=await r.json();}catch{throw Error('The server returned an incomplete response. Please retry shortly.');}
 if(!r.ok)throw Error(data.error||'Could not load account data. Please retry.');
 return data;
}
