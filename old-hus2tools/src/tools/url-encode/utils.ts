export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string | { error: string } {
  try {
    return decodeURIComponent(input);
  } catch (e) {
    return { error: '无效的 URL 编码: ' + (e as Error).message };
  }
}

export interface UrlParam {
  key: string;
  value: string;
}

export function parseUrlParams(input: string): UrlParam[] {
  try {
    const url = new URL(input.startsWith('http') ? input : 'https://example.com' + (input.startsWith('/') ? '' : '/') + input);
    return Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value }));
  } catch {
    const match = input.match(/[?&]([^=&]+)=([^&]*)/g);
    if (!match) return [];
    return match.map(m => {
      const [key, value] = m.slice(1).split('=');
      return { key: decodeURIComponent(key), value: decodeURIComponent(value || '') };
    });
  }
}

export function parseFullUrl(input: string): { protocol: string; host: string; pathname: string; hash: string; params: UrlParam[] } | { error: string } {
  try {
    const url = new URL(input.startsWith('http') ? input : 'https://' + input);
    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
      hash: url.hash,
      params: parseUrlParams(input),
    };
  } catch {
    return { error: '无效的 URL' };
  }
}
