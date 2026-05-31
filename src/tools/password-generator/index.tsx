import { useState } from 'react';
import { KeyRound, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClaySlider from '@/components/shared/ClaySlider';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import { cn } from '@/lib/utils';
import { generatePassword, calculateStrength, type PasswordOptions } from './utils';

const STRENGTH_CONFIG = {
  weak: { label: '弱', color: 'bg-error', width: 'w-1/4' },
  medium: { label: '中等', color: 'bg-warning', width: 'w-2/4' },
  strong: { label: '强', color: 'bg-primary', width: 'w-3/4' },
  'very-strong': { label: '非常强', color: 'bg-success', width: 'w-full' },
};

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = () => {
    const opts: PasswordOptions = { length, ...options, excludeAmbiguous: false };
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generatePassword(opts));
    }
    setPasswords(results);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnyOption = Object.values(options).some(Boolean);

  return (
    <BasicToolLayout
      title="密码生成器"
      description="生成随机安全密码并检测强度"
      icon={<KeyRound className="w-7 h-7" />}
      resultSection={
        passwords.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                生成结果
              </span>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {passwords.map((pwd, i) => {
                const strength = calculateStrength(pwd);
                const strengthKey = strength.score <= 2 ? 'weak' : strength.score <= 4 ? 'medium' : strength.score <= 5 ? 'strong' : 'very-strong';
                const config = STRENGTH_CONFIG[strengthKey];
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface dark:bg-black/40 shadow-clay-inset">
                      <span className="flex-1 font-mono text-sm text-on-surface break-all">{pwd}</span>
                      <CopyButton text={pwd} />
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', config.color, config.width)} />
                      </div>
                      <span className="text-xs text-outline">{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      }
      showResult={passwords.length > 0}
    >
      <ClaySlider label="密码长度" value={length} min={8} max={128} onChange={setLength} />

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">字符集</label>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'uppercase' as const, label: '大写字母 (A-Z)' },
            { key: 'lowercase' as const, label: '小写字母 (a-z)' },
            { key: 'numbers' as const, label: '数字 (0-9)' },
            { key: 'symbols' as const, label: '符号 (!@#$...)' },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleOption(opt.key)}
              className={cn(
                'px-4 py-2 rounded-2xl text-sm font-medium transition-all clay-button',
                options[opt.key]
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ClayFieldInput
        label="生成数量"
        type="number"
        min={1}
        max={50}
        value={count}
        onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
      />

      <ClayButton variant="primary" size="lg" icon={<KeyRound className="w-5 h-5" />} onClick={handleGenerate} disabled={!hasAnyOption}>
        生成密码
      </ClayButton>
    </BasicToolLayout>
  );
}
