import { useState, useCallback } from 'react';
import { KeyRound } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { cn } from '@/lib/utils';
import { generateBatch, calculateStrength, type PasswordOptions } from './utils';

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

const BATCH_OPTIONS = [1, 5, 10] as const;

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [batchCount, setBatchCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    setPasswords(generateBatch(batchCount, options));
  }, [batchCount, options]);

  const handleOptionChange = useCallback(<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const charTypeChecks: { key: keyof PasswordOptions; label: string }[] = [
    { key: 'lowercase', label: '小写 (a-z)' },
    { key: 'uppercase', label: '大写 (A-Z)' },
    { key: 'numbers', label: '数字 (0-9)' },
    { key: 'symbols', label: '符号 (!@#...)' },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <KeyRound className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">密码生成器</h2>
          <p className="text-sm text-on-surface-variant">生成安全的随机密码</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant w-12 shrink-0">长度</span>
          <input
            type="range"
            min={8}
            max={64}
            value={options.length}
            onChange={e => handleOptionChange('length', Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-mono text-primary w-8 text-right">{options.length}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {charTypeChecks.map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options[item.key] as boolean}
                onChange={e => handleOptionChange(item.key, e.target.checked)}
                className="accent-primary rounded"
              />
              <span className="text-sm text-on-surface">{item.label}</span>
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={e => handleOptionChange('excludeAmbiguous', e.target.checked)}
            className="accent-primary rounded"
          />
          <span className="text-sm text-on-surface">排除易混淆字符 (i, l, 1, L, o, 0, O)</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant">生成数量</span>
          <div className="flex gap-1">
            {BATCH_OPTIONS.map(count => (
              <button
                key={count}
                onClick={() => setBatchCount(count)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  batchCount === count
                    ? 'bg-primary text-on-primary shadow-clay'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          生成密码
        </button>
      </div>

      {passwords.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-auto">
          {passwords.map((pwd, i) => {
            const strength = calculateStrength(pwd);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: strength.color }}
                />
                <span className="flex-1 text-sm font-mono text-on-surface break-all">{pwd}</span>
                <span className="text-xs shrink-0" style={{ color: strength.color }}>{strength.label}</span>
                <CopyButton text={pwd} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
