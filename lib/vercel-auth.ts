import 'server-only';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { db } from './db';
export const sessionCookie = process.env.NODE_ENV === 'production' ? '__Host-fund-session' : 'fund-session';
export const sessionSeconds = 8 * 60 * 60;
export type DashboardUser = { userId: string; email: string; displayName: string; fullName: null; role: 'owner' | 'editor' };
export const ownerId = () => process.env.DASHBOARD_OWNER_ID || '5e030b26-cefa-4c6a-bc78-e64386ca1aba';
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const configured = () => !!process.env.DASHBOARD_EMAIL && (process.env.DASHBOARD_PASSWORD?.length ?? 0) >= 16;
const ownerEmail = () => normalizeEmail(process.env.DASHBOARD_EMAIL || '');
const ownerStamp = () => digest(ownerEmail() + ':' + process.env.DASHBOARD_PASSWORD);
const equal = (a: string, b: string) => timingSafeEqual(Buffer.from(digest(a), 'hex'), Buffer.from(digest(b), 'hex'));
const derive = (password: string, salt: string): Promise<Buffer> => new Promise((resolve, reject) => {
  scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key));
});
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(hash, 'hex'));
}
type Member = { id: string; email: string; password_hash: string; revision: number };
export class LoginError extends Error { constructor(message: string, public status: number) { super(message); } }
async function rateLimit(key: string, limit: number) {
  const now = Math.floor(Date.now() / 1000), window = Math.floor(now / 900);
  const row = await db().prepare('INSERT INTO auth_attempts (key,window,count,expires) VALUES (?,?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_attempts.window=excluded.window THEN auth_attempts.count+1 ELSE 1 END,window=excluded.window,expires=excluded.expires RETURNING count').bind(digest(key), window, now + 1800).first<{count: number}>();
  if (!row || row.count > limit) throw new LoginError('Too many attempts. Please try again in 15 minutes.', 429);
}
export async function signIn(emailInput: string, password: string, ip: string) {
  if (!configured()) throw new LoginError('Dashboard login is not configured.', 503);
  const email = normalizeEmail(emailInput);
  await rateLimit('ip:' + ip, 50); await rateLimit('email:' + email, 10);
  let id: string, stamp: string;
  if (email === ownerEmail()) {
    if (!equal(password, process.env.DASHBOARD_PASSWORD!)) throw new LoginError('Email or password is incorrect.', 401);
    id = ownerId(); stamp = ownerStamp();
  } else {
    const member = await db().prepare('SELECT id,email,password_hash,revision FROM dashboard_members WHERE email=?').bind(email).first<Member>();
    const valid = await verifyPassword(password, member?.password_hash || 'scrypt$' + '0'.repeat(32) + '$' + '0'.repeat(128));
    if (!member || !valid) throw new LoginError('Email or password is incorrect.', 401);
    id = member.id; stamp = String(member.revision);
  }
  const now = Math.floor(Date.now() / 1000), token = randomBytes(32).toString('hex');
  await db().prepare('DELETE FROM dashboard_sessions WHERE expires<=?').bind(now).run();
  await db().prepare('DELETE FROM auth_attempts WHERE expires<=?').bind(now).run();
  await db().prepare('INSERT INTO dashboard_sessions (token_hash,user_id,stamp,expires) VALUES (?,?,?,?)').bind(digest(token), id, stamp, now + sessionSeconds).run();
  return token;
}
export async function sessionUser(token: string | undefined): Promise<DashboardUser | null> {
  if (!configured() || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db().prepare('SELECT user_id,stamp FROM dashboard_sessions WHERE token_hash=? AND expires>?').bind(digest(token), Math.floor(Date.now()/1000)).first<{user_id: string; stamp: string}>();
  if (!session) return null;
  if (session.user_id === ownerId()) {
    if (!equal(session.stamp, ownerStamp())) return null;
    return {userId: ownerId(), email: ownerEmail(), displayName: ownerEmail(), fullName: null, role: 'owner'};
  }
  const member = await db().prepare('SELECT id,email,password_hash,revision FROM dashboard_members WHERE id=?').bind(session.user_id).first<Member>();
  if (!member || session.stamp !== String(member.revision) || member.email === ownerEmail()) return null;
  return {userId: member.id, email: member.email, displayName: member.email, fullName: null, role: 'editor'};
}
export async function signOut(token: string | undefined) {
  if (token) await db().prepare('DELETE FROM dashboard_sessions WHERE token_hash=?').bind(digest(token)).run();
}
export async function saveMember(emailInput: string, password: string, reset: boolean) {
  const email = normalizeEmail(emailInput);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new LoginError('Enter a valid email address.', 400);
  if (email === ownerEmail()) throw new LoginError('The owner account is managed in Vercel settings.', 400);
  if (password.length < 16 || password.length > 256) throw new LoginError('Use a password with 16–256 characters.', 400);
  const exists = await db().prepare('SELECT id FROM dashboard_members WHERE email=?').bind(email).first<{id:string}>();
  if (reset && !exists) throw new LoginError('Member not found.', 404);
  if (!reset && exists) throw new LoginError('This member already exists. Use Reset password.', 409);
  const hash = await hashPassword(password);
  if (reset) await db().prepare('UPDATE dashboard_members SET password_hash=?,revision=revision+1 WHERE email=?').bind(hash, email).run();
  else await db().prepare('INSERT INTO dashboard_members (id,email,password_hash,revision,created_at) VALUES (?,?,?,1,?)').bind(randomUUID(), email, hash, new Date().toISOString()).run();
}
