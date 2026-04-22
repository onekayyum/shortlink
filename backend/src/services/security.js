const badHosts = ['localhost', '127.0.0.1', '0.0.0.0'];

export function isMaliciousUrl(url) {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return true;
    if (badHosts.includes(u.hostname)) return true;
    return false;
  } catch {
    return true;
  }
}

export function fingerprint(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  return `${req.params.code}:${ip}:${ua}`;
}
