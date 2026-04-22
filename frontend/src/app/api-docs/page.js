import AppShell from '@/components/AppShell';

export default function ApiDocs(){
  return <AppShell><div className="card p-6 prose prose-invert max-w-none"><h1>API Docs</h1><p>Create link endpoint:</p><pre>POST /links/api/create\nHeaders: x-api-key\nBody: {`{"originalUrl":"https://example.com"}`}</pre><p>Analytics endpoint:</p><pre>GET /links/analytics/:id</pre><p>Telegram/webhook automation supported via <code>webhookUrl</code> on link creation.</p></div></AppShell>;
}
