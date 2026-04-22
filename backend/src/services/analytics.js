import fetch from 'node-fetch';
import { UAParser } from 'ua-parser-js';

export async function getCountryFromIp(ip) {
  if (!ip || ip === 'unknown' || ip.includes('127.0.0.1')) return 'Unknown';
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
    const j = await r.json();
    return j.country_name || j.country || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export function parseDevice(ua) {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    device: result.device.type || 'desktop',
    os: result.os.name || 'Unknown'
  };
}

export function parseReferrer(ref = '') {
  const r = ref.toLowerCase();
  if (!r) return 'direct';
  if (r.includes('whatsapp')) return 'whatsapp';
  if (r.includes('telegram')) return 'telegram';
  if (r.includes('facebook')) return 'facebook';
  if (r.includes('twitter') || r.includes('x.com')) return 'twitter';
  return 'other';
}
