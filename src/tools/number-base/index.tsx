import { useState } from 'react';
import { Calculator } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { convertBase, type NumberBase } from './utils';

interface BaseField {
  label: string;
  base: number;
  prefix: string;
}

const BASES: BaseField[] = [
  { label: '二进制', base: 2, prefix: '0b' },
  { label: '八进制', base: 8, prefix: '0o' },
  { label: '十进制', base: 10, prefix: '' },
  { label: '十六进制', base: 16, prefix: '0x' },
];

export default function NumberBaseTool() {
  const [activeBase, setActiveBase] = useState(10);
  const [inputValue, setInputValue] = usePersistInput('number-base');

  const getConvertedValue = (targetBase: number): string => {
    if (!inputValue) return '';
    const baseMap: Record<number, NumberBase> = { 2: 'bin', 8: 'oct', 10: 'dec', 16: 'hex' };
    const result = convertBase(inputValue, baseMap[activeBase] || 'dec', baseMap[targetBase] || 'dec');
    return typeof result === 'string' ? result : result.error;
  };

  return (
    <BasicToolLayout
      title="进制转换"
      description="二进制、八进制、十进制、十六进制互相转换"
      icon={<Calculator className="w-7 h-7" />}
    >
      <div className="flex flex-col gap-3">
        {BASES.map((field) => (
          <div key={field.base} className="flex items-center gap-3">
            <div
              className={cn(
                'w-20 shrink-0 text-center px-3 py-2 rounded-2xl text-xs font-bold transition-all clay-button',
                activeBase === field.base
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
              )}
            >
              {field.label}
            </div>
            <input
              type="text"
              value={activeBase === field.base ? inputValue : getConvertedValue(field.base)}
              onChange={(e) => {
                setActiveBase(field.base);
                setInputValue(e.target.value);
              }}
              onFocus={() => setActiveBase(field.base)}
              placeholder={`${field.label}数值...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface font-mono placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <CopyButton
              text={activeBase === field.base ? inputValue : getConvertedValue(field.base)}
            />
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset mt-2">
        <span className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main mb-2 block">快速参考</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-outline">
          {BASES.map((field) => (
            <div key={field.base} className="text-center">
              <div className="font-medium text-on-surface-variant">{field.label}</div>
              <div>基数: {field.base}</div>
              <div>前缀: {field.prefix || '无'}</div>
            </div>
          ))}
        </div>
      </div>
    </BasicToolLayout>
  );
}
