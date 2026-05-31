import { useState } from 'react';
import { GitCompare, Trash2, CheckCircle } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { computeDiff, getDiffStats, type DiffLine } from './utils';

export default function TextDiff() {
  const [original, setOriginal] = usePersistInput('text-diff-original');
  const [modified, setModified] = usePersistInput('text-diff-modified');
  const [result, setResult] = useState<DiffLine[] | null>(null);

  const handleCompare = () => {
    const res = computeDiff(original, modified);
    setResult(res);
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
    setResult(null);
  };

  const diffText = result ? result.map(d => d.content).join('') : '';

  return (
    <BasicToolLayout
      title="文本对比"
      description="比较两段文本的差异，高亮增删内容"
      icon={<GitCompare className="w-7 h-7" />}
      resultSection={
        result ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                对比结果
              </span>
              <div className="flex gap-2">
                <CopyButton text={diffText} />
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4 px-4 py-2 rounded-2xl bg-surface dark:bg-black/40 shadow-clay-inset">
              <span className="text-xs font-semibold text-success">+{result ? getDiffStats(result).added : 0} 增加</span>
              <span className="text-xs font-semibold text-error">-{result ? getDiffStats(result).removed : 0} 删除</span>
              <span className="text-xs font-semibold text-info">{result ? getDiffStats(result).unchanged : 0} 未变更</span>
            </div>
            <div className="rounded-2xl bg-surface dark:bg-black/40 shadow-clay-inset p-4 max-h-64 overflow-auto">
              {result?.map((part: DiffLine, i: number) => (
                <span
                  key={i}
                  className={cn(
                    part.type === 'added' && 'bg-clay-green-light/30 text-clay-green-deep',
                    part.type === 'removed' && 'bg-clay-pink-light/30 text-clay-pink-deep',
                    part.type === 'unchanged' && 'text-on-surface'
                  )}
                >
                  {part.content}
                </span>
              ))}
            </div>
          </div>
        ) : null
      }
      showResult={result !== null}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-bold rounded-2xl bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all clay-button"
        >
          <Trash2 className="w-4 h-4 inline-block mr-1" />
          清空
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">原始文本</label>
          <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="输入原始文本..."
              className="w-full h-full text-sm bg-transparent text-on-surface placeholder:text-outline resize-none focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">修改文本</label>
          <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="输入修改后的文本..."
              className="w-full h-full text-sm bg-transparent text-on-surface placeholder:text-outline resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCompare}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <GitCompare className="w-5 h-5" />
          对比
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
