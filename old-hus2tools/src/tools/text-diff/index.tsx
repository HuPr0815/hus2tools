import { useState, useCallback } from 'react';
import { GitCompare } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { computeDiff, getDiffStats, type DiffLine } from './utils';

export default function TextDiff() {
  const [oldText, setOldText, clearOld] = usePersistInput('text-diff:old');
  const [newText, setNewText, clearNew] = usePersistInput('text-diff:new');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [stats, setStats] = useState<{ added: number; removed: number; unchanged: number } | null>(null);

  const handleCompare = useCallback(() => {
    const result = computeDiff(oldText, newText);
    setDiff(result);
    setStats(getDiffStats(result));
  }, [oldText, newText]);

  const handleClear = useCallback(() => {
    clearOld();
    clearNew();
    setDiff([]);
    setStats(null);
  }, [clearOld, clearNew]);

  const diffText = diff.map(d => {
    const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
    return prefix + d.content;
  }).join('\n');

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <GitCompare className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">文本 Diff 对比</h2>
          <p className="text-sm text-on-surface-variant">比较两段文本的差异</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">原始文本</div>
          <textarea
            value={oldText}
            onChange={e => setOldText(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-40 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">修改后文本</div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="输入修改后文本..."
            className="w-full h-40 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleCompare}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          对比
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
        {stats && (
          <div className="flex items-center gap-3 ml-auto text-xs">
            <span className="text-emerald-400">+{stats.added} 新增</span>
            <span className="text-red-400">-{stats.removed} 删除</span>
          </div>
        )}
      </div>

      {diff.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">差异结果</div>
            <CopyButton text={diffText} />
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-surface-container-lowest border border-outline-variant/30">
            <table className="w-full text-sm font-mono">
              <tbody>
                {diff.map((line, i) => (
                  <tr
                    key={i}
                    className={cn(
                      line.type === 'added' && 'bg-emerald-500/10',
                      line.type === 'removed' && 'bg-red-500/10',
                    )}
                  >
                    <td className="px-2 py-0.5 text-right text-outline select-none w-10 border-r border-border-light">
                      {line.oldLineNumber ?? ''}
                    </td>
                    <td className="px-2 py-0.5 text-right text-outline select-none w-10 border-r border-border-light">
                      {line.newLineNumber ?? ''}
                    </td>
                    <td className={cn(
                      'px-3 py-0.5 whitespace-pre',
                      line.type === 'added' && 'text-emerald-400',
                      line.type === 'removed' && 'text-red-400',
                      line.type === 'unchanged' && 'text-on-surface',
                    )}>
                      <span className="select-none mr-2">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </span>
                      {line.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
