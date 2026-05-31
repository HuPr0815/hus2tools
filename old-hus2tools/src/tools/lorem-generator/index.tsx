import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { generateLorem, type LoremType } from './utils';

type TypeOption = { key: LoremType; label: string };

const TYPE_OPTIONS: TypeOption[] = [
  { key: 'chinese-paragraph', label: '中文段落' },
  { key: 'english-paragraph', label: '英文段落' },
  { key: 'chinese-title', label: '中文标题' },
  { key: 'phone', label: '手机号' },
  { key: 'email', label: '邮箱' },
  { key: 'address', label: '地址' },
  { key: 'company', label: '公司名' },
];

export default function LoremGenerator() {
  const [selectedType, setSelectedType] = usePersistInput('lorem-generator:type', 'chinese-paragraph');
  const [countStr, setCountStr] = usePersistInput('lorem-generator:count', '5');
  const [results, setResults] = useState<string[]>([]);

  const loremType = selectedType as LoremType;
  const count = Math.min(50, Math.max(1, parseInt(countStr) || 5));

  const handleGenerate = useCallback(() => {
    setResults(generateLorem(loremType, count));
  }, [loremType, count]);

  const handleClear = useCallback(() => {
    setResults([]);
  }, []);

  const allText = results.join('\n');

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">随机文本生成</h2>
          <p className="text-sm text-on-surface-variant">生成中文/英文占位文本与测试数据</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TYPE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelectedType(opt.key)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              selectedType === opt.key
                ? 'bg-primary text-on-primary shadow-clay'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-on-surface-variant shrink-0">生成数量</span>
        <input
          type="number"
          min={1}
          max={50}
          value={countStr}
          onChange={e => setCountStr(e.target.value)}
          className="w-24 px-3 py-1.5 text-sm rounded-md bg-surface-container-low border-none text-on-surface shadow-clay-inset focus:ring-2 focus:ring-primary/20 font-mono"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          生成
        </button>
        {results.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            清空
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              生成结果 ({results.length})
            </div>
            <CopyButton text={allText} />
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-surface-container-lowest border border-outline-variant/30">
            {results.map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-2 border-b border-border-light last:border-b-0 hover:bg-surface-container/50 group"
              >
                <span className="text-xs text-outline w-6 text-right shrink-0 pt-0.5">{i + 1}</span>
                <span className={cn(
                  'flex-1 break-all',
                  (loremType === 'chinese-paragraph' || loremType === 'english-paragraph')
                    ? 'text-sm text-on-surface leading-relaxed'
                    : 'text-sm font-mono text-on-surface'
                )}>
                  {text}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
                  <CopyButton text={text} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
