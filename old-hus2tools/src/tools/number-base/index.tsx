import { useMemo, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { convertAll, formatBinary, formatHex, type NumberBase } from './utils';

const BASE_OPTIONS: { key: NumberBase; label: string; radix: number }[] = [
  { key: 'bin', label: 'BIN', radix: 2 },
  { key: 'oct', label: 'OCT', radix: 8 },
  { key: 'dec', label: 'DEC', radix: 10 },
  { key: 'hex', label: 'HEX', radix: 16 },
];

const RESULT_LABELS: Record<NumberBase, string> = {
  bin: 'BIN',
  oct: 'OCT',
  dec: 'DEC',
  hex: 'HEX',
};

export default function NumberBaseTool() {
  const [input, setInput, clearInput] = usePersistInput('number-base');
  const [fromBase, setFromBase] = usePersistInput('number-base-from', 'dec');

  const results = useMemo(() => {
    if (!input) return null;
    return convertAll(input, fromBase as NumberBase);
  }, [input, fromBase]);

  const handleClear = useCallback(() => {
    clearInput();
  }, [clearInput]);

  const formatValue = useCallback((base: NumberBase, value: string) => {
    if (base === 'bin') return formatBinary(value);
    if (base === 'hex') return formatHex(value);
    return value;
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Calculator className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">进制转换</h2>
          <p className="text-sm text-on-surface-variant">二进制、八进制、十进制、十六进制互转</p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入数值..."
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono"
        />
        <div className="flex gap-1">
          {BASE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFromBase(opt.key)}
              className={cn(
                'px-3 py-2 text-xs font-mono rounded-md transition-colors',
                fromBase === opt.key
                  ? 'bg-primary text-on-primary shadow-clay'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {opt.radix}
            </button>
          ))}
        </div>
        <button
          onClick={handleClear}
          className="px-3 py-2 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      {results && 'error' in results && (
        <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
          {results.error}
        </div>
      )}

      {results && !('error' in results) && (
        <div className="flex flex-col gap-2">
          {(['bin', 'oct', 'dec', 'hex'] as NumberBase[]).map(base => (
            <div
              key={base}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30',
                fromBase === base && 'border-primary/40'
              )}
            >
              <span className="text-xs font-mono font-semibold text-primary w-8">{RESULT_LABELS[base]}</span>
              <span className="flex-1 text-sm font-mono text-on-surface break-all">
                {formatValue(base, results[base])}
              </span>
              <CopyButton text={results[base]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
