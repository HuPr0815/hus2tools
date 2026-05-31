export interface CronField {
  name: string;
  label: string;
  min: number;
  max: number;
}

export const CRON_FIELDS: CronField[] = [
  { name: 'second', label: '秒', min: 0, max: 59 },
  { name: 'minute', label: '分', min: 0, max: 59 },
  { name: 'hour', label: '时', min: 0, max: 23 },
  { name: 'dayOfMonth', label: '日', min: 1, max: 31 },
  { name: 'month', label: '月', min: 1, max: 12 },
  { name: 'dayOfWeek', label: '周', min: 0, max: 6 },
];

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export interface CronPreset {
  name: string;
  cron: string;
  description: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { name: '每分钟', cron: '0 * * * * *', description: '每分钟执行一次' },
  { name: '每小时', cron: '0 0 * * * *', description: '每小时整点执行' },
  { name: '每天0点', cron: '0 0 0 * * *', description: '每天凌晨0点执行' },
  { name: '每天9点', cron: '0 0 9 * * *', description: '每天上午9点执行' },
  { name: '每周一9点', cron: '0 0 9 * * 1', description: '每周一上午9点执行' },
  { name: '每月1号0点', cron: '0 0 0 1 * *', description: '每月1号凌晨0点执行' },
  { name: '工作日9点', cron: '0 0 9 * * 1-5', description: '周一到周五上午9点执行' },
  { name: '每5分钟', cron: '0 */5 * * * *', description: '每5分钟执行一次' },
  { name: '每30分钟', cron: '0 */30 * * * *', description: '每30分钟执行一次' },
  { name: '每2小时', cron: '0 0 */2 * * *', description: '每2小时执行一次' },
];

export function generateCron(fields: Record<string, string>): string {
  return CRON_FIELDS.map(f => fields[f.name] || '*').join(' ');
}

export function parseCron(cron: string): Record<string, string> {
  const parts = cron.trim().split(/\s+/);
  const result: Record<string, string> = {};
  CRON_FIELDS.forEach((f, i) => {
    result[f.name] = parts[i] || '*';
  });
  return result;
}

export function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 6) return '无效的 Cron 表达式';

  const [sec, min, hour, dom, mon, dow] = parts;

  const desc: string[] = [];

  if (mon !== '*') {
    desc.push(`${mon}月`);
  }

  if (dom !== '*' && dow !== '*') {
    desc.push(`每月${dom}号且周${describeDow(dow)}`);
  } else if (dom !== '*') {
    desc.push(`每月${dom}号`);
  } else if (dow !== '*') {
    desc.push(`每${describeDow(dow)}`);
  }

  if (hour !== '*') {
    desc.push(`${describeField(hour, '时')}`);
  }

  if (min !== '*') {
    desc.push(`${describeField(min, '分')}`);
  }

  if (sec !== '*' && sec !== '0') {
    desc.push(`${describeField(sec, '秒')}`);
  }

  if (desc.length === 0) return '每秒执行';
  return desc.join('') + '执行';
}

function describeDow(dow: string): string {
  if (dow === '*') return '';
  if (dow.includes('-')) {
    const [s, e] = dow.split('-').map(Number);
    return `${WEEKDAY_LABELS[s]}到${WEEKDAY_LABELS[e]}`;
  }
  const n = parseInt(dow);
  if (!isNaN(n) && n >= 0 && n <= 6) return `周${WEEKDAY_LABELS[n]}`;
  return dow;
}

function describeField(val: string, unit: string): string {
  if (val.startsWith('*/')) return `每隔${val.slice(2)}${unit}`;
  return `${val}${unit}`;
}

export function getNextExecutions(cron: string, count: number = 5): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 6) return [];

  const fields = parseCron(cron);
  const results: Date[] = [];
  const now = new Date();
  let current = new Date(now.getTime() + 1000);
  current.setMilliseconds(0);

  const maxIterations = 100000;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    if (matchesField(fields.second, current.getSeconds()) &&
        matchesField(fields.minute, current.getMinutes()) &&
        matchesField(fields.hour, current.getHours()) &&
        matchesField(fields.dayOfMonth, current.getDate()) &&
        matchesField(fields.month, current.getMonth() + 1) &&
        matchesField(fields.dayOfWeek, current.getDay())) {
      results.push(new Date(current.getTime()));
    }
    current = new Date(current.getTime() + 1000);
  }

  return results;
}

function matchesField(pattern: string, value: number): boolean {
  if (pattern === '*') return true;

  for (const part of pattern.split(',')) {
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2));
      if (step > 0 && value % step === 0) return true;
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (value >= start && value <= end) return true;
    } else {
      if (parseInt(part) === value) return true;
    }
  }
  return false;
}
