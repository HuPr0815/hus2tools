import { useState } from 'react';
import { StickyNote, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { cn } from '@/lib/utils';
import { generateLorem, type LoremType } from './utils';

const LANGUAGES = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
];

const TYPES = [
  { id: 'paragraph', label: '段落' },
  { id: 'sentence', label: '句子' },
  { id: 'title', label: '标题' },
  { id: 'address', label: '地址' },
  { id: 'company', label: '公司' },
];

export default function LoremGeneratorTool() {
  const [language, setLanguage] = useState('zh');
  const [type, setType] = useState('paragraph');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    const typeMap: Record<string, string> = { 'paragraph': 'chinese-paragraph', 'sentence': 'english-paragraph', 'title': 'chinese-title', 'address': 'address', 'company': 'company' };
    const loremType = (typeMap[type] || 'chinese-paragraph') as LoremType;
    const result = generateLorem(loremType, count);
    setOutput(result.join('\n\n'));
  };

  return (
    <BasicToolLayout
      title="占位文本生成"
      description="生成中文/英文占位文本、地址、公司名等"
      icon={<StickyNote className="w-7 h-7" />}
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
      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">语言</label>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={cn(
                'px-4 py-2 rounded-2xl text-sm font-medium transition-all clay-button',
                language === lang.id
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">类型</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                'px-4 py-2 rounded-2xl text-sm font-medium transition-all clay-button',
                type === t.id
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">数量</label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
          className="w-32 px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <button
        onClick={handleGenerate}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <StickyNote className="w-5 h-5" />
          生成文本
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
