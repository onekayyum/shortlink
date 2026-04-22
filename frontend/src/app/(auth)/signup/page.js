'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { req } from '@/lib/api';

export default function Signup(){
  const [username,setU]=useState(''); const [password,setP]=useState(''); const [err,setErr]=useState('');
  const r=useRouter();
  const submit=async()=>{ try{ await req('/auth/signup','POST',{username,password},false); r.push('/login'); }catch(e){setErr(e.message);} };
  return <div className="min-h-screen grid place-items-center"><div className="card p-6 w-full max-w-md space-y-3"><h1 className="text-2xl font-semibold">Create account</h1><input className="input" placeholder="Username" onChange={e=>setU(e.target.value)}/><input type="password" className="input" placeholder="Password" onChange={e=>setP(e.target.value)}/>{err&&<p className="text-red-400 text-sm">{err}</p>}<button className="btn w-full" onClick={submit}>Sign up</button></div></div>
}
