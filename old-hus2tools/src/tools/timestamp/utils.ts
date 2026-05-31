export function isTimestamp(input: string): boolean {
  return /^\d{10,13}$/.test(input.trim());
}

export function isMilliseconds(ts: number): boolean {
  return ts > 1e12;
}

export function timestampToDate(input: string): string | { error: string } {
  const num = Number(input.trim());
  if (isNaN(num)) return { error: '无效的时间戳' };
  const ms = isMilliseconds(num) ? num : num * 1000;
  if (ms < 0 || ms > 8640000000000000) return { error: '时间戳超出范围' };
  return new Date(ms).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

export function dateToTimestamp(input: string): string | { error: string } {
  const d = new Date(input);
  if (isNaN(d.getTime())) return { error: '无效的日期格式' };
  return String(Math.floor(d.getTime() / 1000));
}

export function getCurrentTimestamp(): { seconds: number; milliseconds: number } {
  const now = Date.now();
  return { seconds: Math.floor(now / 1000), milliseconds: now };
}

export function formatMultiple(timestamp: number): Record<string, string> {
  const ms = isMilliseconds(timestamp) ? timestamp : timestamp * 1000;
  const d = new Date(ms);
  return {
    'ISO 8601': d.toISOString(),
    '北京时间': d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    'UTC时间': d.toLocaleString('zh-CN', { timeZone: 'UTC' }),
    '纽约时间': d.toLocaleString('zh-CN', { timeZone: 'America/New_York' }),
    '东京时间': d.toLocaleString('zh-CN', { timeZone: 'Asia/Tokyo' }),
    '伦敦时间': d.toLocaleString('zh-CN', { timeZone: 'Europe/London' }),
  };
}
