export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export async function sendRequest(config: RequestConfig): Promise<ResponseData> {
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: ['GET', 'HEAD'].includes(config.method) ? undefined : config.body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const body = await response.text();
    const time = Math.round(performance.now() - start);
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      time,
      size: new TextEncoder().encode(body).length,
    };
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export function formatResponseHeaders(headers: Record<string, string>): string {
  return Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n');
}

export function tryFormatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
