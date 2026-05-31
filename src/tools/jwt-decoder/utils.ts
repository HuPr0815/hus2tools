export interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  isExpired: boolean;
  expiresAt: string | null;
  issuedAt: string | null;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return atob(base64);
}

export function decodeJwt(token: string): DecodedJwt | { error: string } {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { error: '无效的 JWT 格式：需要 3 个部分（header.payload.signature）' };

    const header: JwtHeader = JSON.parse(base64UrlDecode(parts[0]));
    const payload: JwtPayload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? now > payload.exp : false;
    const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString('zh-CN') : null;
    const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString('zh-CN') : null;

    return { header, payload, signature, isExpired, expiresAt, issuedAt };
  } catch (e) {
    return { error: 'JWT 解码失败: ' + (e as Error).message };
  }
}
