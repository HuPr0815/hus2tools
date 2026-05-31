import { useState } from 'react';
import { Code2, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { encodeHtmlEntities, decodeHtmlEntities } from './utils';

const COMMON_ENTITIES = [
  { char: '&', entity: '&amp;', name: 'Ampersand' },
  { char: '<', entity: '&lt;', name: 'Less than' },
  { char: '>', entity: '&gt;', name: 'Greater than' },
  { char: '"', entity: '&quot;', name: 'Double quote' },
  { char: "'", entity: '&apos;', name: 'Single quote' },
  { char: ' ', entity: '&nbsp;', name: 'Non-breaking space' },
  { char: '©', entity: '&copy;', name: 'Copyright' },
  { char: '®', entity: '&reg;', name: 'Registered' },
  { char: '™', entity: '&trade;', name: 'Trademark' },
];

export default function HtmlEntities() {
  const [input, setInput, _clearInput] = usePersistInput('html-entities');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    if (mode === 'encode') {
      setOutput(encodeHtmlEntities(input, 'named'));
    } else {
      setOutput(decodeHtmlEntities(input));
    }
  };

  return (
    <BasicToolLayout
      title="HTML 实体编码/解码"
      description="对 HTML 实体进行编码和解码"
      icon={<Code2 className="w-7 h-7" />}
      resultSection={
        output ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                输出
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
          onClick={() => setMode('encode')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            mode === 'encode'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          编码
        </button>
        <button
          onClick={() => setMode('decode')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            mode === 'decode'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          解码
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">输入</label>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 HTML 实体...'}
            className="w-full h-full text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Code2 className="w-5 h-5" />
          {mode === 'encode' ? '编码' : '解码'}
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">常用实体参考</label>
        <div className="w-full rounded-2xl shadow-clay-inset bg-surface dark:bg-black/40 overflow-auto max-h-40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-4 py-2 text-left text-outline font-medium">字符</th>
                <th className="px-4 py-2 text-left text-outline font-medium">实体</th>
                <th className="px-4 py-2 text-left text-outline font-medium">名称</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_ENTITIES.map((e, i) => (
                <tr key={i} className="border-b border-outline-variant last:border-0">
                  <td className="px-4 py-2 text-on-surface">{e.char}</td>
                  <td className="px-4 py-2 text-on-surface font-mono">{e.entity}</td>
                  <td className="px-4 py-2 text-outline">{e.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BasicToolLayout>
  );
}
