'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { req } from '@/lib/api';

export default function CreateLinkModal({ open, onClose, onDone }) {
  const [tab, setTab] = useState('basic');
  const [f, setF] = useState({ originalUrl: '', shortCode: '', password: '', expiryAt: '', fallbackUrl: '', geoCountry: '', geoUrl: '', mobileUrl: '', desktopUrl: '', retargetingPixel: '', webhookUrl: '' });
  if (!open) return null;
  const submit = async () => {
    const body = {
      originalUrl: f.originalUrl, shortCode: f.shortCode || undefined, password: f.password || undefined,
      expiryAt: f.expiryAt || undefined, fallbackUrl: f.fallbackUrl || undefined,
      geoTargeting: f.geoCountry && f.geoUrl ? { [f.geoCountry]: f.geoUrl } : {},
      deviceTargeting: { ...(f.mobileUrl ? { mobile: f.mobileUrl } : {}), ...(f.desktopUrl ? { desktop: f.desktopUrl } : {}) },
      retargetingPixel: f.retargetingPixel || '', webhookUrl: f.webhookUrl || '',
      lastPrefs: { tab }
    };
    await req('/links', 'POST', body);
    onDone();
    onClose();
  };
  return <div className="fixed inset-0 bg-black/60 grid place-items-center p-4">
    <motion.div initial={{ scale: .97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-2xl p-5 space-y-4">
      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded-lg ${tab==='basic'?'bg-slate-700':'bg-slate-800'}`} onClick={()=>setTab('basic')}>Basic</button>
        <button className={`px-3 py-1 rounded-lg ${tab==='advanced'?'bg-slate-700':'bg-slate-800'}`} onClick={()=>setTab('advanced')}>Advanced</button>
      </div>
      {tab==='basic' ? <div className="grid gap-3">
        <input className="input" placeholder="Destination URL" onChange={e=>setF({...f,originalUrl:e.target.value})}/>
        <input className="input" placeholder="Custom slug" onChange={e=>setF({...f,shortCode:e.target.value})}/>
        <input className="input" placeholder="Password (optional)" type="password" onChange={e=>setF({...f,password:e.target.value})}/>
      </div>:<div className="grid gap-3">
        <input className="input" type="datetime-local" onChange={e=>setF({...f,expiryAt:new Date(e.target.value).toISOString()})}/>
        <div className="grid grid-cols-2 gap-2"><input className="input" placeholder="Country e.g. US" onChange={e=>setF({...f,geoCountry:e.target.value})}/><input className="input" placeholder="Geo target URL" onChange={e=>setF({...f,geoUrl:e.target.value})}/></div>
        <input className="input" placeholder="Mobile URL" onChange={e=>setF({...f,mobileUrl:e.target.value})}/>
        <input className="input" placeholder="Desktop URL" onChange={e=>setF({...f,desktopUrl:e.target.value})}/>
        <input className="input" placeholder="Fallback URL" onChange={e=>setF({...f,fallbackUrl:e.target.value})}/>
        <input className="input" placeholder="Retargeting pixel" onChange={e=>setF({...f,retargetingPixel:e.target.value})}/>
        <input className="input" placeholder="Webhook URL" onChange={e=>setF({...f,webhookUrl:e.target.value})}/>
      </div>}
      <div className="flex justify-end gap-2"><button onClick={onClose}>Cancel</button><button className="btn" onClick={submit}>Create</button></div>
    </motion.div>
  </div>;
}
