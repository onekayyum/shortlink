'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['Dashboard', '/dashboard'],
  ['Settings', '/settings'],
  ['Admin', '/admin'],
  ['API', '/api-docs']
];

export default function AppShell({ children }) {
  const p = usePathname();
  return <div className="min-h-screen grid grid-cols-[250px_1fr]">
    <aside className="p-4 border-r border-slate-800 bg-slate-950">
      <h1 className="font-bold text-xl mb-6">Shortlink SaaS</h1>
      <nav className="space-y-2">
        {items.map(([t, href]) => <Link className={`block rounded-xl px-3 py-2 ${p === href ? 'bg-slate-800' : 'hover:bg-slate-900'}`} key={href} href={href}>{t}</Link>)}
      </nav>
    </aside>
    <main className="p-6">{children}</main>
  </div>;
}
