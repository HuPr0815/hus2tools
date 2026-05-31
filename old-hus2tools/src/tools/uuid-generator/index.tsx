import { useState, useCallback } from 'react';
import { Fingerprint } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { generateBatch } from './utils';

const COUNT_OPTIONS = [1, 5, 10, 20, 50];

export default function UuidGenerator() {
  const [count, setCount] = usePersistInput('uuid-generator', '5');
  const [uppercase, setUppercase] = useState(false);
  const [noHyphen, setNoHyphen] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    const num = parseInt(count, 10) || 1;
    const result = generateBatch(Math.min(num, 100));
    setUuids(result);
  }, [count]);

  const formatUuid = useCallback((uuid: string) => {
    let u = uppercase ? uuid.toUpperCase() : uuid.toLowerCase();
    if (noHyphen) u = u.replace(/-/g, '');
    return u;
  }, [uppercase, noHyphen]);

  const allText = uuids.map(formatUuid).join('\n');

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Fingerprint className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">UUID 生成器</h2>
          <p className="text-sm text-on-surface-variant">批量生成 UUID v4</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs text-on-surface-variant">数量:</span>
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setCount(String(n))}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                count === String(n)
                  ? 'bg-primary text-on-primary shadow-clay'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          生成
        </button>
        <button
          onClick={() => setUppercase(!uppercase)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            uppercase
              ? 'bg-primary text-on-primary shadow-clay'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          {uppercase ? '大写' : '小写'}
        </button>
        <button
          onClick={() => setNoHyphen(!noHyphen)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            noHyphen
              ? 'bg-primary text-on-primary shadow-clay'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          {noHyphen ? '无连字符' : '带连字符'}
        </button>
        {uuids.length > 0 && (
          <button
            onClick={() => setUuids([])}
            className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            清空
          </button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              生成结果 ({uuids.length})
            </div>
            <CopyButton text={allText} />
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-surface-container-lowest border border-outline-variant/30">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-1.5 border-b border-border-light last:border-b-0 hover:bg-surface-container/50 group"
              >
                <span className="text-xs text-outline w-6 text-right shrink-0">{i + 1}</span>
                <span className="font-mono text-sm text-on-surface flex-1 break-all">{formatUuid(uuid)}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <CopyButton text={formatUuid(uuid)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
