'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { req } from '@/lib/api';

export default function Settings(){
  const [me,setMe]=useState(null); const [username,setUsername]=useState(''); const [apiKey,setApiKey]=useState('');
  useEffect(()=>{ req('/user/me').then(d=>{setMe(d);setUsername(d.username);setApiKey(d.apiKey);}); },[]);
  if(!me) return <AppShell>Loading...</AppShell>;
  return <AppShell><div className="grid md:grid-cols-2 gap-4">
    <div className="card p-4 space-y-2"><h2 className="font-semibold">Account</h2><input className="input" value={username} onChange={e=>setUsername(e.target.value)}/><button className="btn" onClick={()=>req('/user/username','PATCH',{username})}>Save Username</button><button onClick={()=>req('/auth/logout-all','POST')}>Logout all devices</button></div>
    <div className="card p-4 space-y-2"><h2 className="font-semibold">API Key</h2><code className="block text-xs break-all">{apiKey}</code><button className="btn" onClick={async()=>setApiKey((await req('/user/api-key/regenerate','POST')).apiKey)}>Regenerate</button></div>
  </div></AppShell>
}
