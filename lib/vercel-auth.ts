import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
export function authorized(value: string | null): boolean {
  const email = process.env.DASHBOARD_EMAIL;
  const password = process.env.DASHBOARD_PASSWORD;
  if (!email || !password || password.length < 16 || !value?.startsWith('Basic ')) return false;
  const encoded = value.slice(6);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded) return false;
  const supplied = bytes.toString('utf8');
  const hash = (text: string) => createHash('sha256').update(text).digest();
  return timingSafeEqual(hash(supplied), hash(email + ':' + password));
}
