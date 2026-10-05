import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {cache} from 'react';
import {sessionCookie,sessionUser,type DashboardUser} from '@/lib/vercel-auth';
export type ChatGPTUser=DashboardUser;
export const getChatGPTUser=cache(async():Promise<ChatGPTUser|null>=>{try{return await sessionUser((await cookies()).get(sessionCookie)?.value);}catch{return null;}});
export async function requireChatGPTUser(_returnTo='/'):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(user)return user;redirect('/login');}
export function chatGPTSignInPath(_returnTo='/'){return '/login';}
