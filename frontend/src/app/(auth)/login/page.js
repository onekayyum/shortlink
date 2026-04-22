'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { req } from '@/lib/api';

export default function Login(){
  const [username,setU]=useState(''); const [password,setP]=useState(''); const [err,setErr]=useState('');
  const router=useRouter();
  const submit=async()=>{ try{ const d=await req('/auth/login','POST',{username,password},false); localStorage.setItem('token',d.token); router.push('/dashboard'); }catch(e){setErr(e.message);} };
  return <div className="min-h-screen grid place-items-center"><div className="card p-6 w-full max-w-md space-y-3"><h1 className="text-2xl font-semibold">Welcome back</h1><input className="input" placeholder="Username" onChange={e=>setU(e.target.value)}/><input type="password" className="input" placeholder="Password" onChange={e=>setP(e.target.value)}/>{err&&<p className="text-red-400 text-sm">{err}</p>}<button className="btn w-full" onClick={submit}>Login</button></div></div>
}
