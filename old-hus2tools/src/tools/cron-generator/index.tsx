import { useState, useMemo, useCallback } from 'react';
import { Clock } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import {
  CRON_FIELDS,
  CRON_PRESETS,
  WEEKDAY_LABELS,
  generateCron,
  parseCron,
  describeCron,
  getNextExecutions,
} from './utils';

export default function CronGenerator() {
  const [cronInput, setCronInput, clearCronInput] = usePersistInput('cron-generator');
  const [fields, setFields] = useState<Record<string, string>>(() =>
    cronInput ? parseCron(cronInput) : { second: '0', minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
  );

  const cronExpression = useMemo(() => generateCron(fields), [fields]);
  const description = useMemo(() => describeCron(cronExpression), [cronExpression]);
  const nextRuns = useMemo(() => getNextExecutions(cronExpression, 5), [cronExpression]);

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFields(prev => {
      const next = { ...prev, [fieldName]: value };
      setCronInput(generateCron(next));
      return next;
    });
  }, [setCronInput]);

  const handlePreset = useCallback((cron: string) => {
    const parsed = parseCron(cron);
    setFields(parsed);
    setCronInput(cron);
  }, [setCronInput]);

  const handleDirectInput = useCallback((value: string) => {
    setCronInput(value);
    const parsed = parseCron(value);
    setFields(parsed);
  }, [setCronInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Cron 表达式生成器</h2>
          <p className="text-sm text-text-secondary">可视化生成和解析 Cron 表达式</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CRON_PRESETS.map((preset) => (
          <button
            key={preset.cron}
            onClick={() => handlePreset(preset.cron)}
            className="px-3 py-1.5 text-xs rounded-md bg-bg-tertiary hover:bg-border text-text-secondary hover:text-text-primary transition-all duration-200"
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Cron 表达式</span>
          <CopyButton text={cronExpression} />
        </div>
        <input
          value={cronExpression}
          onChange={(e) => handleDirectInput(e.target.value)}
          className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-lg font-mono text-primary text-center tracking-widest outline-none focus:border-primary/50 transition-all duration-200"
        />
        <p className="mt-2 text-sm text-text-secondary text-center">{description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CRON_FIELDS.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {field.label} ({field.min}-{field.max})
            </label>
            <select
              value={fields[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="bg-bg-secondary border border-border rounded-lg px-2 py-2 text-sm text-text-primary outline-none focus:border-primary/50 transition-all duration-200"
            >
              <option value="*">每{field.label} (*)</option>
              {field.name === 'dayOfWeek' ? (
                <>
                  {WEEKDAY_LABELS.map((label, i) => (
                    <option key={i} value={String(i)}>周{label}</option>
                  ))}
                  <option value="1-5">工作日 (1-5)</option>
                  <option value="0,6">周末 (0,6)</option>
                </>
              ) : (
                <>
                  <option value={`*/1`}>每隔1{field.label}</option>
                  <option value={`*/2`}>每隔2{field.label}</option>
                  <option value={`*/5`}>每隔5{field.label}</option>
                  <option value={`*/10`}>每隔10{field.label}</option>
                  <option value={`*/15`}>每隔15{field.label}</option>
                  <option value={`*/30`}>每隔30{field.label}</option>
                  {Array.from({ length: field.max - field.min + 1 }, (_, i) => i + field.min).map(v => (
                    <option key={v} value={String(v)}>{String(v).padStart(2, '0')}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        ))}
      </div>

      {nextRuns.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">下次执行时间</div>
          <div className="space-y-1.5">
            {nextRuns.map((date, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="font-mono text-text-primary">
                  {date.getFullYear()}-{String(date.getMonth() + 1).padStart(2, '0')}-{String(date.getDate()).padStart(2, '0')}
                  {' '}
                  {String(date.getHours()).padStart(2, '0')}:{String(date.getMinutes()).padStart(2, '0')}:{String(date.getSeconds()).padStart(2, '0')}
                </span>
                <span className="text-text-muted text-xs">
                  周{WEEKDAY_LABELS[date.getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={clearCronInput}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
}
