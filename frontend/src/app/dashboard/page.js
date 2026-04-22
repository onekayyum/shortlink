'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import CreateLinkModal from '@/components/CreateLinkModal';
import { req, API } from '@/lib/api';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import QRCode from 'qrcode';

export default function Dashboard(){
  const [links,setLinks]=useState([]); const [open,setOpen]=useState(false); const [analytics,setAnalytics]=useState(null); const [qr,setQr]=useState('');
  const load=()=>req('/links').then(setLinks).catch(()=>location.href='/login');
  useEffect(()=>{load();},[]);
  const totalClicks=links.reduce((a,l)=>a+l.clicks,0);
  const viewAnalytics=async(id)=>setAnalytics(await req(`/links/analytics/${id}`));
  const showQr=async(code)=>setQr(await QRCode.toDataURL(`${API}/${code}`,{width:512}));
  const daily = useMemo(()=>analytics?Object.entries(analytics.daily).map(([date,clicks])=>({date,clicks})):[],[analytics]);
  const refs = useMemo(()=>analytics?Object.entries(analytics.referrers).map(([name,value])=>({name,value})):[],[analytics]);

  return <AppShell><div className="space-y-4">
    <div className="flex justify-between"><h1 className="text-3xl font-bold">Dashboard</h1><button className="btn" onClick={()=>setOpen(true)}>+ New Link</button></div>
    <div className="grid md:grid-cols-3 gap-3"><div className="card p-4"><p className="text-slate-400">Total Links</p><p className="text-2xl font-semibold">{links.length}</p></div><div className="card p-4"><p className="text-slate-400">Total Clicks</p><p className="text-2xl font-semibold">{totalClicks}</p></div><div className="card p-4"><p className="text-slate-400">Growth</p><p className="text-2xl font-semibold">{daily.length?'+':'0'}{daily.length}</p></div></div>
    <div className="card p-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-400"><th>Short</th><th>Destination</th><th>Clicks</th><th>Actions</th></tr></thead><tbody>{links.map(l=><tr className="border-t border-slate-800 hover:bg-slate-800/40" key={l.id}><td className="py-3">/{l.shortCode}</td><td className="truncate max-w-[280px]">{l.originalUrl}</td><td>{l.clicks}</td><td className="space-x-2"><button onClick={()=>viewAnalytics(l.id)}>Analytics</button><button onClick={()=>showQr(l.shortCode)}>QR</button></td></tr>)}</tbody></table></div>
    {analytics && <div className="grid md:grid-cols-2 gap-4"><div className="card p-4"><LineChart width={430} height={240} data={daily}><Line type="monotone" dataKey="clicks" stroke="#60a5fa" /><CartesianGrid stroke="#334155" /><XAxis dataKey="date"/><YAxis/><Tooltip/></LineChart></div><div className="card p-4"><PieChart width={400} height={240}><Pie data={refs} dataKey="value" nameKey="name" outerRadius={90}>{refs.map((_,i)=><Cell key={i} fill={['#60a5fa','#a78bfa','#22c55e','#f59e0b'][i%4]}/>)}</Pie><Tooltip/></PieChart></div></div>}
    {qr && <div className="fixed inset-0 bg-black/70 grid place-items-center" onClick={()=>setQr('')}><div className="card p-5" onClick={e=>e.stopPropagation()}><img src={qr} className="w-80 h-80"/><a href={qr} download="qrcode.png" className="btn block text-center mt-3">Download QR (PNG)</a></div></div>}
    <CreateLinkModal open={open} onClose={()=>setOpen(false)} onDone={load} />
  </div></AppShell>
}
