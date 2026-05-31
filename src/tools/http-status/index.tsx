import { useState } from 'react';
import { Wifi, Search, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { cn } from '@/lib/utils';
import { getStatusByCode, type HttpStatus } from './utils';

const CATEGORIES = [
  { label: '1xx', range: [100, 199] as const, color: 'bg-clay-blue-light text-clay-blue-dark' },
  { label: '2xx', range: [200, 299] as const, color: 'bg-clay-green-light text-clay-green-deep' },
  { label: '3xx', range: [300, 399] as const, color: 'bg-clay-yellow-light text-clay-yellow-dark' },
  { label: '4xx', range: [400, 499] as const, color: 'bg-clay-pink-light text-clay-pink-deep' },
  { label: '5xx', range: [500, 599] as const, color: 'bg-clay-purple-light text-clay-purple-dark' },
];

export default function HttpStatus() {
  const [inputCode, setInputCode] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [result, setResult] = useState<HttpStatus | null>(null);

  const handleSearch = () => {
    const code = parseInt(inputCode, 10);
    if (isNaN(code)) return;
    const info = getStatusByCode(code);
    setResult(info ?? null);
  };

  const handleCategoryFilter = (label: string) => {
    setActiveCategory(activeCategory === label ? null : label);
  };

  const code = parseInt(inputCode, 10);
  const statusColor = !isNaN(code) && code >= 100 && code < 600
    ? code < 200
      ? 'text-info'
      : code < 300
        ? 'text-success'
        : code < 400
          ? 'text-warning'
          : code < 500
            ? 'text-error'
            : 'text-clay-purple-dark'
    : '';

  return (
    <BasicToolLayout
      title="HTTP 状态码"
      description="查询 HTTP 状态码的含义与测试场景"
      icon={<Wifi className="w-7 h-7" />}
      resultSection={
        result ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                查询结果
              </span>
              <div className="flex gap-2">
                <CopyButton text={`${result.code} ${result.phrase}`} />
              </div>
            </div>
            <div className="rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant p-6 shadow-clay">
              <div className="flex items-center gap-4 mb-4">
                <span className={cn('text-4xl font-bold', statusColor)}>{result.code}</span>
                <span className="text-lg font-semibold text-on-surface">{result.phrase}</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{result.description}</p>
            </div>
          </div>
        ) : null
      }
      showResult={result !== null}
    >
      <div className="flex items-center gap-2">
        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
          placeholder="输入状态码，如 404"
          className="w-40 px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="group relative px-6 py-3 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Search className="w-4 h-4" />
            查询
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryFilter(cat.label)}
            className={cn(
              'px-3 py-2 rounded-2xl text-xs font-semibold transition-all clay-button',
              activeCategory === cat.label
                ? cat.color + ' shadow-clay'
                : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <span className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main mb-3 block">状态码参考</span>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES
            .filter((cat) => !activeCategory || cat.label === activeCategory)
            .map((cat) => (
              <div key={cat.label} className="flex flex-col gap-1">
                <span className={cn('text-xs font-bold', cat.color.split(' ')[1])}>{cat.label}</span>
                <div className="text-xs text-outline px-2 py-1 rounded-lg bg-surface dark:bg-black/40 shadow-clay-inset">
                  {cat.range[0]} - {cat.range[1]}
                </div>
              </div>
            ))}
        </div>
      </div>
    </BasicToolLayout>
  );
}
