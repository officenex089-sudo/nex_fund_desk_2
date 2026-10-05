import { db } from './db';
import type { ChatGPTUser } from '@/app/chatgpt-auth';
export function isWorkspaceOwner(u: ChatGPTUser) { return u.email.toLowerCase() === process.env.DASHBOARD_EMAIL?.toLowerCase(); }
export const viewerActions = new Set(['list', 'refresh', 'spend']);
export async function workspace(u: ChatGPTUser) {
  const isOwner = isWorkspaceOwner(u);
  if (!isOwner) throw Error('Owner access required.');
  await db().prepare("INSERT INTO team_workspace(id,owner) VALUES('main',?) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner").bind(u.userId).run();
  return { owner: u.userId, isOwner };
}
