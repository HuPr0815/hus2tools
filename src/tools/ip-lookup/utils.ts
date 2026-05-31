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

export function isValidIp(ip: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

export function getMyIp(): Promise<string | null> {
  return fetch('https://api.ipify.org?format=json')
    .then((r) => r.json())
    .then((d) => d.ip)
    .catch(() => null);
}
