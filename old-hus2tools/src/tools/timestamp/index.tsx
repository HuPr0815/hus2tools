import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ArrowRightLeft } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import {
  isTimestamp,
  timestampToDate,
  dateToTimestamp,
  getCurrentTimestamp,
  formatMultiple,
} from './utils';

export default function TimestampTool() {
  const [input, setInput, clearInput] = usePersistInput('timestamp');
  const [currentTs, setCurrentTs] = useState(getCurrentTimestamp());
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampToDate = useCallback(() => {
    if (!input.trim()) return;
    setError('');
    const r = timestampToDate(input);
    if (typeof r !== 'string') {
      setError(r.error);
      setResult(null);
    } else {
      const num = Number(input.trim());
      setResult(formatMultiple(num));
    }
  }, [input]);

  const handleDateToTimestamp = useCallback(() => {
    if (!input.trim()) return;
    setError('');
    const r = dateToTimestamp(input);
    if (typeof r !== 'string') {
      setError(r.error);
      setResult(null);
    } else {
      const num = Number(r);
      setResult(formatMultiple(num));
    }
  }, [input]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim();
    setTimeout(() => {
      if (isTimestamp(pasted)) {
        const r = timestampToDate(pasted);
        if (typeof r === 'string') {
          setResult(formatMultiple(Number(pasted)));
          setError('');
        }
      }
    }, 0);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">时间戳转换</h2>
          <p className="text-sm text-on-surface-variant">Unix 时间戳与日期互转</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
        <span className="text-sm text-on-surface-variant shrink-0">当前时间戳</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-on-surface">{currentTs.seconds}</span>
          <CopyButton text={String(currentTs.seconds)} />
          <span className="text-outline text-xs">秒</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-on-surface">{currentTs.milliseconds}</span>
          <CopyButton text={String(currentTs.milliseconds)} />
          <span className="text-outline text-xs">毫秒</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder="输入时间戳或日期字符串..."
          className="flex-1 min-w-[200px] px-3 py-1.5 text-sm rounded-md bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono"
        />
        <button
          onClick={handleTimestampToDate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          时间戳→日期
        </button>
        <button
          onClick={handleDateToTimestamp}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          日期→时间戳
        </button>
        <button
          onClick={clearInput}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-md bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left px-4 py-2 text-on-surface-variant font-medium">格式</th>
                <th className="text-left px-4 py-2 text-on-surface-variant font-medium">值</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([key, value]) => (
                <tr key={key} className="border-b border-border-light last:border-b-0">
                  <td className="px-4 py-2 text-on-surface-variant whitespace-nowrap">{key}</td>
                  <td className="px-4 py-2 text-on-surface font-mono break-all">{value}</td>
                  <td className="px-2">
                    <CopyButton text={value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
