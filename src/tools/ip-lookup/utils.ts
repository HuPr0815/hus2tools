export interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
}

export async function lookupIp(ip: string): Promise<IpInfo | null> {
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = Number(part);
    return num >= 0 && num <= 255 && String(num) === part;
  });
}

export function isValidIpv6(ip: string): boolean {
  // Full or abbreviated IPv6
  const full = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const abbreviated = /^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/;
  return full.test(ip) || abbreviated.test(ip);
}

export function isValidIp(ip: string): boolean {
  return isValidIpv4(ip) || isValidIpv6(ip);
}

export function getMyIp(): Promise<string | null> {
  return fetch('https://api.ipify.org?format=json')
    .then((r) => r.json())
    .then((d) => d.ip)
    .catch(() => null);
}
