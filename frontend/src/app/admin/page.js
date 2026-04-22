'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { req } from '@/lib/api';

export default function Admin(){
  const [stats,setStats]=useState(null); const [users,setUsers]=useState([]); const [settings,setSettings]=useState(null);
  const load=()=>{req('/admin/stats').then(setStats); req('/admin/users').then(setUsers); req('/admin/settings').then(setSettings);} ;
  useEffect(()=>{load();},[]);
  if(!stats) return <AppShell>Admin only</AppShell>;
  return <AppShell><div className="space-y-4">
    <div className="grid grid-cols-3 gap-3"><div className="card p-4">Users {stats.users}</div><div className="card p-4">Links {stats.links}</div><div className="card p-4">Clicks {stats.clicks}</div></div>
    <div className="card p-4"><h2 className="mb-2">User management</h2>{users.map(u=><div key={u.id} className="flex justify-between border-t border-slate-800 py-2"><span>{u.username} ({u.status})</span><div className="space-x-2"><button onClick={()=>req(`/admin/users/${u.id}/status`,'PATCH',{status:u.status==='active'?'banned':'active'}).then(load)}>{u.status==='active'?'Ban':'Unban'}</button><button onClick={()=>req(`/admin/users/${u.id}`,'DELETE').then(load)}>Delete</button></div></div>)}</div>
    {settings&&<div className="card p-4 space-y-2"><h2>SMTP + Feature Toggles</h2><label><input type="checkbox" checked={settings.smtp.enabled} onChange={e=>setSettings({...settings,smtp:{...settings.smtp,enabled:e.target.checked}})}/> SMTP Enabled</label><input className="input" placeholder="host" value={settings.smtp.host} onChange={e=>setSettings({...settings,smtp:{...settings.smtp,host:e.target.value}})}/><button className="btn" onClick={()=>req('/admin/settings','PATCH',settings)}>Save</button></div>}
  </div></AppShell>
}
