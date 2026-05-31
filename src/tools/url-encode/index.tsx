import { useState } from 'react';
import { Link, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { urlEncode, urlDecode, parseUrlParams } from './utils';

export default function UrlEncode() {
  const [input, setInput, _clearInput] = usePersistInput('url-encode');
  const [output, setOutput] = useState('');
  const [params, setParams] = useState<{ key: string; value: string }[]>([]);
  const [mode, setMode] = useState<'encode' | 'decode' | 'parse'>('encode');

  const handleConvert = () => {
    if (mode === 'encode') {
      setOutput(urlEncode(input));
      setParams([]);
    } else if (mode === 'decode') {
      const decoded = urlDecode(input);
      setOutput(typeof decoded === 'string' ? decoded : decoded.error);
      setParams([]);
    } else {
      setParams(parseUrlParams(input));
      setOutput('');
    }
  };

  return (
    <BasicToolLayout
      title="URL 编码/解码"
      description="对 URL 进行编码、解码和参数解析"
      icon={<Link className="w-7 h-7" />}
      resultSection={
        (output || params.length > 0) ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                {mode === 'parse' ? '参数列表' : '输出'}
              </span>
              <div className="flex gap-2">
                <CopyButton text={output || params.map(p => `${p.key}=${p.value}`).join('&')} />
              </div>
            </div>
            {mode !== 'parse' ? (
              <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[120px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
                <pre className="whitespace-pre-wrap"><code>{output || '结果将显示在这里...'}</code></pre>
              </div>
            ) : (
              params.length > 0 && (
                <div className="overflow-auto rounded-2xl shadow-clay-inset bg-surface dark:bg-black/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="px-4 py-2 text-left text-outline font-medium">Key</th>
                        <th className="px-4 py-2 text-left text-outline font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {params.map((p, i) => (
                        <tr key={i} className="border-b border-outline-variant last:border-0">
                          <td className="px-4 py-2 text-on-surface font-mono">{p.key}</td>
                          <td className="px-4 py-2 text-on-surface font-mono">{p.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        ) : null
      }
      showResult={!!output || params.length > 0}
    >
      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
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
        <button
          onClick={() => setMode('parse')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            mode === 'parse'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          解析
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">输入</label>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的 URL...' : mode === 'decode' ? '输入要解码的 URL...' : '输入要解析的 URL...'}
            className="w-full h-full text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Link className="w-5 h-5" />
          {mode === 'encode' ? '编码' : mode === 'decode' ? '解码' : '解析'}
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
