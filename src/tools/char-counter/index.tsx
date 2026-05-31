import { useMemo } from 'react';
import { Type, Trash2 } from 'lucide-react';
import { usePersistInput } from '@/hooks/usePersistInput';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { cn } from '@/lib/utils';
import { countChars } from './utils';

export default function CharCounter() {
  const [text, setText, clearText] = usePersistInput('char-counter');

  const stats = useMemo(() => countChars(text), [text]);

  const statItems = [
    { label: '字符数', value: stats.chars },
    { label: '字符(无空格)', value: stats.charsNoSpace },
    { label: '单词数', value: stats.words },
    { label: '行数', value: stats.lines },
    { label: '字节数', value: stats.bytes },
    { label: '段落数', value: stats.paragraphs },
  ];

  return (
    <BasicToolLayout
      title="字符统计"
      description="实时统计字符、单词、行数等信息"
      icon={<Type className="w-7 h-7" />}
    >
      <div className="flex items-center justify-end gap-2">
        <CopyButton text={text} />
        <button
          onClick={clearText}
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all clay-button"
        >
          <Trash2 className="w-3 h-3" />
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant p-3 shadow-clay text-center"
          >
            <div className="text-2xl font-bold text-primary dark:text-clay-green-main">{item.value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">输入文本</label>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴文本..."
            className="w-full h-full text-sm bg-transparent text-on-surface placeholder:text-outline resize-none focus:outline-none"
          />
        </div>
      </div>

      {stats.wordFrequency.length > 0 && (
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">词频 Top 10</label>
          <div className="w-full rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant shadow-clay-inset overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-on-surface-variant">排名</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-on-surface-variant">单词</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-on-surface-variant">次数</th>
                </tr>
              </thead>
              <tbody>
                {stats.wordFrequency.slice(0, 10).map((item, i) => (
                  <tr key={item.word} className={cn(i % 2 === 0 ? 'bg-surface-container-low/30 dark:bg-black/20' : '')}>
                    <td className="px-4 py-1.5 text-outline">{i + 1}</td>
                    <td className="px-4 py-1.5 text-on-surface font-medium">{item.word}</td>
                    <td className="px-4 py-1.5 text-right text-primary dark:text-clay-green-main font-semibold">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </BasicToolLayout>
  );
}
