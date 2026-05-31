import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { timestampToDate, dateToTimestamp } from './utils';

export default function TimestampTool() {
  const [timestampInput, setTimestampInput] = usePersistInput('timestamp-value');
  const [dateInput, setDateInput] = useState('');
  const [liveTimestamp, setLiveTimestamp] = useState(0);
  const [timezones] = useState([
    { label: 'UTC', offset: 'UTC' },
    { label: '北京 (CST)', offset: 'Asia/Shanghai' },
    { label: '东京 (JST)', offset: 'Asia/Tokyo' },
    { label: '纽约 (EST)', offset: 'America/New_York' },
    { label: '伦敦 (GMT)', offset: 'Europe/London' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setLiveTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampToDate = () => {
    const ts = Number(timestampInput);
    if (!isNaN(ts)) {
      const result = timestampToDate(String(ts));
      setDateInput(typeof result === 'string' ? result : result.error);
    }
  };

  const handleDateToTimestamp = () => {
    if (dateInput) {
      const result = dateToTimestamp(dateInput);
      setTimestampInput(typeof result === 'string' ? result : result.error);
    }
  };

  const formatLiveDate = (offset: string) => {
    try {
      return new Date().toLocaleString('zh-CN', { timeZone: offset });
    } catch {
      return '-';
    }
  };

  return (
    <BasicToolLayout
      title="时间戳转换"
      description="时间戳与日期时间互相转换"
      icon={<Clock className="w-7 h-7" />}
    >
      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main">当前时间戳</span>
          <CopyButton text={String(Math.floor(liveTimestamp / 1000))} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-mono font-bold text-primary dark:text-clay-green-main">
            {Math.floor(liveTimestamp / 1000)}
          </span>
          <span className="text-xs text-outline">秒</span>
        </div>
        <div className="text-xs text-outline mt-1 font-mono">
          毫秒: {liveTimestamp}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">时间戳</label>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="输入时间戳..."
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleTimestampToDate}
            className="py-3 rounded-2xl bg-clay-blue-light text-clay-blue-deep font-bold shadow-clay clay-button text-sm"
          >
            转为日期
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">日期时间</label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleDateToTimestamp}
            className="py-3 rounded-2xl bg-clay-blue-light text-clay-blue-deep font-bold shadow-clay clay-button text-sm"
          >
            转为时间戳
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <span className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main mb-3 block">多时区显示</span>
        <div className="grid grid-cols-2 gap-2">
          {timezones.map((tz) => (
            <div key={tz.offset} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface dark:bg-black/40 shadow-clay-inset">
              <span className="text-xs text-outline">{tz.label}</span>
              <span className="text-xs font-mono text-on-surface">{formatLiveDate(tz.offset)}</span>
            </div>
          ))}
        </div>
      </div>
    </BasicToolLayout>
  );
}
