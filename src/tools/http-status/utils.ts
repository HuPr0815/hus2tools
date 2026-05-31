export interface HttpStatus {
  code: number;
  phrase: string;
  description: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
}

export const HTTP_STATUSES: HttpStatus[] = [
  { code: 100, phrase: 'Continue', description: '服务器已收到请求的第一部分，等待其余部分', category: '1xx' },
  { code: 101, phrase: 'Switching Protocols', description: '服务器正在按客户端的请求切换协议', category: '1xx' },
  { code: 200, phrase: 'OK', description: '请求成功', category: '2xx' },
  { code: 201, phrase: 'Created', description: '请求成功且创建了新资源', category: '2xx' },
  { code: 204, phrase: 'No Content', description: '请求成功但无内容返回', category: '2xx' },
  { code: 301, phrase: 'Moved Permanently', description: '资源已永久移动到新 URL', category: '3xx' },
  { code: 302, phrase: 'Found', description: '资源临时移动到其他 URL', category: '3xx' },
  { code: 304, phrase: 'Not Modified', description: '资源未修改，可使用缓存', category: '3xx' },
  { code: 400, phrase: 'Bad Request', description: '请求语法错误，服务器无法理解', category: '4xx' },
  { code: 401, phrase: 'Unauthorized', description: '请求需要身份验证', category: '4xx' },
  { code: 403, phrase: 'Forbidden', description: '服务器拒绝执行请求', category: '4xx' },
  { code: 404, phrase: 'Not Found', description: '请求的资源不存在', category: '4xx' },
  { code: 405, phrase: 'Method Not Allowed', description: '请求方法不被允许', category: '4xx' },
  { code: 408, phrase: 'Request Timeout', description: '请求超时', category: '4xx' },
  { code: 409, phrase: 'Conflict', description: '请求与服务器当前状态冲突', category: '4xx' },
  { code: 429, phrase: 'Too Many Requests', description: '请求过于频繁，已被限流', category: '4xx' },
  { code: 500, phrase: 'Internal Server Error', description: '服务器内部错误', category: '5xx' },
  { code: 502, phrase: 'Bad Gateway', description: '网关或代理服务器收到无效响应', category: '5xx' },
  { code: 503, phrase: 'Service Unavailable', description: '服务器暂时无法处理请求', category: '5xx' },
  { code: 504, phrase: 'Gateway Timeout', description: '网关或代理服务器请求超时', category: '5xx' },
];

export function getStatusByCode(code: number): HttpStatus | undefined {
  return HTTP_STATUSES.find((s) => s.code === code);
}

export function getStatusesByCategory(category: string): HttpStatus[] {
  return HTTP_STATUSES.filter((s) => s.category === category);
}
