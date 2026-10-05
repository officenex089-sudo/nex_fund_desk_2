'use client';
import { useState, type FormEvent } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function Login() {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent) {
    event.preventDefault(); setBusy(true);setError('');
    try {
      const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email,password})});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw Error(result.error||'Could not sign in.');
      window.location.replace('/');
    } catch(error) {setError(error instanceof Error?error.message:'Could not sign in.');setBusy(false);}
  }
  return <main className="login-shell"><section className="login-card"><span className="login-icon"><Wallet size={28}/></span><p className="eyebrow">NEX FUND DESK</p><h1>Welcome back</h1><p className="muted">Sign in to your shared client workspace.</p><form onSubmit={submit} className="login-form"><label htmlFor="email">Email address</label><Input id="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><label htmlFor="password">Dashboard password</label><Input id="password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p role="alert" className="red">{error}</p>}<Button disabled={busy} type="submit">{busy?'Signing in…':'Sign in'}</Button></form><p className="login-hint">New team member or forgot your password? Ask the workspace owner to set up your access. Use your dashboard password here.</p></section></main>;
}
