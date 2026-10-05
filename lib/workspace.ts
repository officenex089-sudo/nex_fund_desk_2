import type {ChatGPTUser} from '@/app/chatgpt-auth';
import {ownerId} from './vercel-auth';
export function isWorkspaceOwner(u:ChatGPTUser){return u.role==='owner'&&u.userId===ownerId();}
export const viewerActions=new Set(['list','refresh','spend']);
export async function workspace(u:ChatGPTUser){if(u.role!=='owner'&&u.role!=='editor')throw Error('Workspace access required.');return {owner:ownerId(),isOwner:isWorkspaceOwner(u),canEdit:true};}
