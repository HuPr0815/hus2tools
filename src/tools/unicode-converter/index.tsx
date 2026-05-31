import { useState } from 'react';
import { Languages, CheckCircle, ArrowLeftRight } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { textToUnicode, unicodeToText } from './utils';

export default function UnicodeConverter() {
  const [input, setInput, _clearInput] = usePersistInput('unicode-converter');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'textToUnicode' | 'unicodeToText'>('textToUnicode');

  const handleConvert = () => {
    if (mode === 'textToUnicode') {
      setOutput(textToUnicode(input, 'unicode'));
    } else {
      const result = unicodeToText(input);
      setOutput(typeof result === 'string' ? result : result.error);
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode((prev) => (prev === 'textToUnicode' ? 'unicodeToText' : 'textToUnicode'));
  };

  return (
    <BasicToolLayout
      title="Unicode 转换"
      description="文本与 Unicode 编码之间的双向转换"
      icon={<Languages className="w-7 h-7" />}
      resultSection={
        output ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                {mode === 'textToUnicode' ? 'Unicode' : '文本'}
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
      <div className="w-full grid grid-cols-2 gap-4">
        <button
          onClick={() => setMode('textToUnicode')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            mode === 'textToUnicode'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          文本 → Unicode
        </button>
        <button
          onClick={() => setMode('unicodeToText')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            mode === 'unicodeToText'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          Unicode → 文本
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">
          {mode === 'textToUnicode' ? '文本' : 'Unicode'}
        </label>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'textToUnicode' ? '输入文本...' : '输入 Unicode 编码 (如 \\u4f60\\u597d)...'}
            className="w-full h-full text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleConvert}
          className="group relative flex-1 py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Languages className="w-5 h-5" />
            转换
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={handleSwap}
          className="px-6 py-5 rounded-full bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all clay-button"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
      </div>
    </BasicToolLayout>
  );
}
