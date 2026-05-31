import { useState, useCallback } from 'react';
import { Database } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { generateBatch, toCSV, toJSON, type DataType } from './utils';

type TypeOption = { key: DataType; label: string };

const TYPE_OPTIONS: TypeOption[] = [
  { key: 'phone', label: '手机号' },
  { key: 'idcard', label: '身份证' },
  { key: 'email', label: '邮箱' },
  { key: 'name', label: '姓名' },
];

export default function DataGenerator() {
  const [selectedTypes, setSelectedTypes, clearTypes] = usePersistInput('data-generator:types', 'phone,name');
  const [countStr, setCountStr, clearCount] = usePersistInput('data-generator:count', '10');
  const [data, setData] = useState<Record<string, string>[]>([]);

  const types = selectedTypes.split(',').filter(Boolean) as DataType[];
  const count = Math.min(100, Math.max(1, parseInt(countStr) || 10));

  const toggleType = useCallback((key: DataType) => {
    setSelectedTypes(prev => {
      const current = prev.split(',').filter(Boolean) as DataType[];
      const next = current.includes(key)
        ? current.filter(t => t !== key)
        : [...current, key];
      return next.join(',');
    });
  }, [setSelectedTypes]);

  const handleGenerate = useCallback(() => {
    if (types.length === 0) return;
    setData(generateBatch(types, count));
  }, [types, count]);

  const handleClear = useCallback(() => {
    clearTypes();
    clearCount();
    setData([]);
  }, [clearTypes, clearCount]);

  const handleCopyJSON = useCallback(() => {
    if (data.length === 0) return;
    navigator.clipboard.writeText(toJSON(data));
  }, [data]);

  const handleCopyCSV = useCallback(() => {
    if (data.length === 0) return;
    navigator.clipboard.writeText(toCSV(data));
  }, [data]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">随机数据生成</h2>
          <p className="text-sm text-text-secondary">生成中国特化测试数据</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {TYPE_OPTIONS.map(opt => (
          <label
            key={opt.key}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm',
              types.includes(opt.key)
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-bg-tertiary text-text-secondary border border-transparent hover:bg-border'
            )}
          >
            <input
              type="checkbox"
              checked={types.includes(opt.key)}
              onChange={() => toggleType(opt.key)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary shrink-0">生成数量</span>
        <input
          type="number"
          min={1}
          max={100}
          value={countStr}
          onChange={e => setCountStr(e.target.value)}
          className="w-24 px-3 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary font-mono"
        />
        <button
          onClick={handleGenerate}
          disabled={types.length === 0}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          生成
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      {data.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-bg-secondary border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-secondary">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-text-secondary font-medium w-12">#</th>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="text-left px-4 py-2 text-text-secondary font-medium whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-border-light last:border-b-0 hover:bg-bg-tertiary/50">
                    <td className="px-4 py-2 text-text-muted">{i + 1}</td>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2 text-text-primary font-mono whitespace-nowrap">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
            >
              复制 JSON
            </button>
            <button
              onClick={handleCopyCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
            >
              复制 CSV
            </button>
            <span className="text-xs text-text-muted ml-auto">共 {data.length} 条</span>
          </div>
        </div>
      )}
    </div>
  );
}
