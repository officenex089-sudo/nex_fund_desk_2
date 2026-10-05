'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Eye, EyeOff, Info, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UsersRound, Wallet } from 'lucide-react';

function NexMark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 25V7h5l10 13V7h5v18h-5L11 12v13H6Z" fill="currentColor"/></svg>;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [help, setHelp] = useState<'password' | 'access' | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setHelp(null);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw Error(result.error || 'Could not sign in. Please try again.');
      window.location.replace('/');
    } catch (error) {
      setError(error instanceof TypeError ? 'Connection interrupted. Check your internet and try again.' : error instanceof Error ? error.message : 'Could not sign in. Please try again.');
      setBusy(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  return <main className="nex-auth">
    <section className="nex-auth-story" aria-label="Nex Fund Desk">
      <div className="nex-auth-grid" aria-hidden="true"/>
      <div className="nex-auth-brand"><span className="nex-auth-mark"><NexMark/></span><span>NEX<span className="nex-auth-brand-divider"/> <b>FUND DESK</b></span></div>
      <div className="nex-auth-intro">
        <p className="nex-auth-kicker"><span/> A CLEARER VIEW OF YOUR BUSINESS</p>
        <h1>Every client.<br/>Every number.<br/><em>One workspace.</em></h1>
        <p className="nex-auth-description">Keep your client balances, budgets and ad spend together. Less switching. More clarity.</p>
        <div className="nex-auth-visual" aria-hidden="true">
          <div className="nex-auth-orbit nex-auth-orbit-one"/><div className="nex-auth-orbit nex-auth-orbit-two"/>
          <div className="nex-auth-mini">
            <div className="nex-auth-mini-top"><span><span className="nex-auth-mini-dot"/>Your workspace</span><span>OVERVIEW <ArrowUpRight size={14}/></span></div>
            <div className="nex-auth-mini-body"><div className="nex-auth-mini-icon"><Wallet size={22}/></div><div><strong>Client accounts</strong><span>Everything in one place</span></div><div className="nex-auth-spark"><i/><i/><i/><i/><i/><i/><i/></div></div>
            <div className="nex-auth-mini-bottom"><span>Balances</span><span>Budgets</span><span>Spend</span></div>
          </div>
          <div className="nex-auth-team-chip"><span><UsersRound size={17}/></span><div>Built for your team<small>Your people. A shared view.</small></div><Check size={15}/></div>
        </div>
      </div>
      <div className="nex-auth-story-footer"><span>Clarity for your next move.</span><span className="nex-auth-footer-line"/><span>01 — NEX</span></div>
    </section>

    <section className="nex-auth-entry" aria-labelledby="sign-in-title">
      <div className="nex-auth-topnote"><ShieldCheck size={15}/> PRIVATE TEAM WORKSPACE</div>
      <div className="nex-auth-form-wrap">
        <div className="nex-auth-welcome-icon"><ArrowUpRight size={25}/></div>
        <p className="nex-auth-form-kicker">GOOD TO SEE YOU AGAIN</p>
        <h2 id="sign-in-title">Welcome back.</h2>
        <p className="nex-auth-subtitle">Your workspace is one sign-in away.</p>

        <form className="nex-auth-form" onSubmit={submit} aria-busy={busy}>
          <div className="nex-auth-field">
            <label htmlFor="email">Email address</label>
            <div className="nex-auth-input"><Mail size={18}/><input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} disabled={busy} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/></div>
          </div>
          <div className="nex-auth-field">
            <div className="nex-auth-label-row"><label htmlFor="password">Password</label><button type="button" className="nex-auth-text-button" aria-expanded={help === 'password'} aria-controls="login-help" onClick={() => setHelp(help === 'password' ? null : 'password')}>Forgot password?</button></div>
            <div className="nex-auth-input"><LockKeyhole size={18}/><input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} disabled={busy} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"/><button className="nex-auth-eye" type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          </div>
          {error && <div ref={errorRef} tabIndex={-1} role="alert" className="nex-auth-feedback nex-auth-error"><Info size={18}/><span>{error}</span></div>}
          <button className="nex-auth-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="nex-auth-spin" size={19}/>Signing you in…</> : <>Sign in to your workspace<ArrowRight size={18}/></>}</button>
        </form>

        <div className="nex-auth-divider"><span/> YOUR TEAM. YOUR WORKSPACE. <span/></div>
        <div className="nex-auth-access"><span className="nex-auth-access-icon"><KeyRound size={19}/></span><div><strong>Joining your team?</strong><p>Your workspace owner can add your account.</p></div><button type="button" aria-label="How to get workspace access" aria-expanded={help === 'access'} aria-controls="login-help" onClick={() => setHelp(help === 'access' ? null : 'access')}><ArrowUpRight size={20}/></button></div>
        <div id="login-help" aria-live="polite">{help && <div className="nex-auth-feedback nex-auth-help"><Info size={18}/><p>{help === 'password' ? 'Ask your workspace owner to reset your password in Team access. Then sign in here with the new dashboard password.' : 'Ask your workspace owner to add your email in Team access and share your dashboard password privately. Then use those details to sign in.'}</p></div>}</div>
      </div>
      <div className="nex-auth-entry-footer"><span>© {new Date().getFullYear()} Nex Fund Desk</span><span><LockKeyhole size={12}/> Access by invitation</span></div>
    </section>
  </main>;
}
