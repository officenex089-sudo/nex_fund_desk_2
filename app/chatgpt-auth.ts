// Compatibility interface for the dashboard; identity is verified on the server.
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authorized } from '@/lib/vercel-auth';
export type ChatGPTUser = { userId: string; displayName: string; email: string; fullName: string | null };
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const h = await headers();
  if (!authorized(h.get('authorization'))) return null;
  const email = process.env.DASHBOARD_EMAIL!;
  return { userId: process.env.DASHBOARD_OWNER_ID || '5e030b26-cefa-4c6a-bc78-e64386ca1aba', email, displayName: email, fullName: null };
}
export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> { const user = await getChatGPTUser(); if (user) return user; redirect('/'); }
export function chatGPTSignInPath(_returnTo = '/') { return '/'; }
export function chatGPTSignOutPath(_returnTo = '/') { return '/'; }
