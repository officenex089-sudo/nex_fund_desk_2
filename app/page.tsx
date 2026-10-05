import Dashboard from './dashboard';
import {requireChatGPTUser} from './chatgpt-auth';
export default async function Page(){await requireChatGPTUser();return <Dashboard/>;}
