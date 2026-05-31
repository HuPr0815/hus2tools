import { useState, useMemo, useCallback } from 'react';
import { Type } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { countChars, removeDuplicates, removeEmptyLines, sortLines, toUpperCase, toLowerCase, type CharStats } from './utils';

type Action = 'dedup' | 'noempty' | 'sort' | 'upper' | 'lower';

const ACTIONS: { key: Action; label: string }[] = [
  { key: 'dedup', label: '去重' },
  { key: 'noempty', label: '去空行' },
  { key: 'sort', label: '排序' },
  { key: 'upper', label: '大写' },
  { key: 'lower', label: '小写' },
];

export default function CharCounter() {
  const [input, setInput, clearInput] = usePersistInput('char-counter');
  const [output, setOutput] = useState('');

  const stats: CharStats = useMemo(() => countChars(input), [input]);

  const handleAction = useCallback((action: Action) => {
    let result = input;
    switch (action) {
      case 'dedup': result = removeDuplicates(input); break;
      case 'noempty': result = removeEmptyLines(input); break;
      case 'sort': result = sortLines(input); break;
      case 'upper': result = toUpperCase(input); break;
      case 'lower': result = toLowerCase(input); break;
    }
    setOutput(result);
  }, [input]);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
  }, [clearInput]);

  const statItems: { label: string; value: number | string }[] = [
    { label: '字符数', value: stats.chars },
    { label: '字符(无空格)', value: stats.charsNoSpace },
    { label: '单词数', value: stats.words },
    { label: '行数', value: stats.lines },
    { label: '字节数', value: stats.bytes },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Type className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">字符统计</h2>
          <p className="text-sm text-text-secondary">统计文本字符数、行数、字节数</p>
        </div>
      </div>

      <div className="flex gap-4">
        {statItems.map(item => (
          <div
            key={item.label}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border text-center"
          >
            <div className="text-lg font-semibold text-primary font-mono">{item.value}</div>
            <div className="text-xs text-text-muted">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(action => (
          <button
            key={action.key}
            onClick={() => handleAction(action.key)}
            className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-primary transition-colors"
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输入</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入或粘贴文本..."
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输出</div>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="操作结果将显示在这里..."
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted font-mono resize-none"
          />
        </div>
      </div>
    </div>
  );
}
