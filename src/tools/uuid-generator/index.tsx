import { useState } from 'react';
import { Fingerprint, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { cn } from '@/lib/utils';
import { generateBatch } from './utils';

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    const uuids = generateBatch(count);
    const processed = uuids.map(u => uppercase ? u.toUpperCase() : u);
    setOutput(hyphens ? processed.join('\n') : processed.map(u => u.replace(/-/g, '')).join('\n'));
  };

  return (
    <BasicToolLayout
      title="UUID 生成器"
      description="批量生成 UUID / GUID"
      icon={<Fingerprint className="w-7 h-7" />}
      resultSection={
        output ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                生成结果
              </span>
              <div className="flex gap-2">
                <CopyButton text={output} />
              </div>
            </div>
            <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[120px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
              <pre className="whitespace-pre-wrap"><code>{output}</code></pre>
            </div>
          </div>
        ) : null
      }
      showResult={!!output}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">数量 (1-100)</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">大写</label>
          <button
            onClick={() => setUppercase(!uppercase)}
            className={cn(
              'w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all clay-button',
              uppercase
                ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
            )}
          >
            {uppercase ? '已开启' : '已关闭'}
          </button>
        </div>
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">连字符</label>
          <button
            onClick={() => setHyphens(!hyphens)}
            className={cn(
              'w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all clay-button',
              hyphens
                ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
            )}
          >
            {hyphens ? '已开启' : '已关闭'}
          </button>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Fingerprint className="w-5 h-5" />
          生成 UUID
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
