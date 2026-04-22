export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function req(path, method = 'GET', body, auth = true) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
