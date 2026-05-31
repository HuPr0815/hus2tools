import { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClaySelect from '@/components/shared/ClaySelect';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import { describeCron, getNextExecutions } from './utils';

const MINUTE_OPTIONS = [
  { value: '*', label: '每分钟' },
  { value: '0', label: '0' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' },
];

const HOUR_OPTIONS = [
  { value: '*', label: '每小时' },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `${i}:00` })),
];

const DAY_OPTIONS = [
  { value: '*', label: '每天' },
  ...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}日` })),
];

const MONTH_OPTIONS = [
  { value: '*', label: '每月' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}月` })),
];

const WEEKDAY_OPTIONS = [
  { value: '*', label: '每天' },
  { value: '0', label: '周日' },
  { value: '1', label: '周一' },
  { value: '2', label: '周二' },
  { value: '3', label: '周三' },
  { value: '4', label: '周四' },
  { value: '5', label: '周五' },
  { value: '6', label: '周六' },
];

export default function CronGenerator() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [expression, setExpression] = useState('0 * * * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    const parts = value.split(' ');
    if (parts.length === 6) {
      setMinute(parts[1]);
      setHour(parts[2]);
      setDay(parts[3]);
      setMonth(parts[4]);
      setWeekday(parts[5]);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    const updates: Record<string, string> = { minute, hour, day, month, weekday };
    updates[field] = value;
    const expr = `0 ${updates.minute} ${updates.hour} ${updates.day} ${updates.month} ${updates.weekday}`;
    setExpression(expr);
    switch (field) {
      case 'minute': setMinute(value); break;
      case 'hour': setHour(value); break;
      case 'day': setDay(value); break;
      case 'month': setMonth(value); break;
      case 'weekday': setWeekday(value); break;
    }
  };

  const handleParse = () => {
    const desc = describeCron(expression);
    if (desc.includes('无效')) {
      setError(desc);
      setDescription('');
      setNextRuns([]);
    } else {
      setError('');
      setDescription(desc);
      const nextDates = getNextExecutions(expression, 5);
      setNextRuns(nextDates.map(d => d.toLocaleString('zh-CN')));
    }
  };

  return (
    <BasicToolLayout
      title="Cron 表达式生成器"
      description="生成和解析 Cron 表达式"
      icon={<Clock className="w-7 h-7" />}
      resultSection={
        (description || error) ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                解析结果
              </span>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-clay-pink-light/30 text-clay-pink-deep text-sm mb-4">
                {error}
              </div>
            )}
            {description && (
              <div className="px-4 py-3 rounded-2xl bg-clay-green-light/30 text-clay-green-deep text-sm mb-4">
                {description}
              </div>
            )}
            {nextRuns.length > 0 && (
              <div className="bg-surface dark:bg-black/40 rounded-2xl shadow-clay-inset overflow-hidden">
                <div className="px-4 py-2 text-xs font-semibold text-on-surface-variant border-b border-outline-variant">接下来 5 次执行时间</div>
                {nextRuns.map((run, i) => (
                  <div key={i} className="px-4 py-2 text-sm font-mono text-on-surface border-b border-outline-variant last:border-0">
                    {run}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null
      }
      showResult={!!description || !!error}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ClaySelect options={MINUTE_OPTIONS} value={minute} onChange={(v) => handleSelectChange('minute', v)} label="分钟" size="sm" />
        <ClaySelect options={HOUR_OPTIONS} value={hour} onChange={(v) => handleSelectChange('hour', v)} label="小时" size="sm" searchable />
        <ClaySelect options={DAY_OPTIONS} value={day} onChange={(v) => handleSelectChange('day', v)} label="日" size="sm" searchable />
        <ClaySelect options={MONTH_OPTIONS} value={month} onChange={(v) => handleSelectChange('month', v)} label="月" size="sm" />
        <ClaySelect options={WEEKDAY_OPTIONS} value={weekday} onChange={(v) => handleSelectChange('weekday', v)} label="星期" size="sm" />
      </div>

      <ClayFieldInput
        label="Cron 表达式"
        value={expression}
        onChange={(e) => handleExpressionChange(e.target.value)}
        placeholder="0 * * * * *"
        className="font-mono"
      />

      <ClayButton variant="primary" size="lg" icon={<Clock className="w-5 h-5" />} onClick={handleParse}>
        解析
      </ClayButton>
    </BasicToolLayout>
  );
}
