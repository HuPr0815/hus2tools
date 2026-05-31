import { useState, useCallback } from 'react';
import { Link } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { urlEncode, urlDecode, parseUrlParams, parseFullUrl, type UrlParam } from './utils';

type Mode = 'encode' | 'decode' | 'parse';

export default function UrlEncode() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput, clearInput] = usePersistInput('url-encode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [params, setParams] = useState<UrlParam[]>([]);
  const [parsedUrl, setParsedUrl] = useState<{ protocol: string; host: string; pathname: string; hash: string; params: UrlParam[] } | null>(null);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setOutput('');
    setError('');
    setParams([]);
    setParsedUrl(null);
  }, []);

  const handleConvert = useCallback(() => {
    if (!input) return;
    setError('');
    setOutput('');
    setParams([]);
    setParsedUrl(null);

    if (mode === 'encode') {
      setOutput(urlEncode(input));
    } else if (mode === 'decode') {
      const result = urlDecode(input);
      if (typeof result === 'string') {
        setOutput(result);
      } else {
        setError(result.error);
      }
    } else {
      const parsed = parseUrlParams(input);
      setParams(parsed);
      const full = parseFullUrl(input);
      if ('error' in full) {
        setError(full.error);
      } else {
        setParsedUrl(full);
      }
    }
  }, [input, mode]);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
    setError('');
    setParams([]);
    setParsedUrl(null);
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Link className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">URL 编解码</h2>
          <p className="text-sm text-on-surface-variant">URL 编码解码和参数解析</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['encode', 'decode', 'parse'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              mode === m
                ? 'bg-primary text-on-primary shadow-clay'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {m === 'encode' ? '编码' : m === 'decode' ? '解码' : '参数解析'}
          </button>
        ))}
        <button
          onClick={handleConvert}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          {mode === 'encode' ? '编码' : mode === 'decode' ? '解码' : '解析'}
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {mode === 'encode' ? '原始文本' : mode === 'decode' ? 'URL 编码字符串' : 'URL 地址'}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '输入要编码的文本...'
                : mode === 'decode'
                  ? '输入 URL 编码字符串...'
                  : '输入完整 URL...'
            }
            className="w-full h-32 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {(mode === 'encode' || mode === 'decode') && output && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                {mode === 'encode' ? '编码结果' : '解码结果'}
              </div>
              <CopyButton text={output} />
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-32 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono resize-none"
            />
          </div>
        )}

        {mode === 'parse' && parsedUrl && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="text-left px-4 py-2 text-on-surface-variant font-medium">属性</th>
                    <th className="text-left px-4 py-2 text-on-surface-variant font-medium">值</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-light">
                    <td className="px-4 py-2 text-on-surface-variant">协议</td>
                    <td className="px-4 py-2 text-on-surface font-mono">{parsedUrl.protocol}</td>
                    <td className="px-2"><CopyButton text={parsedUrl.protocol} /></td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="px-4 py-2 text-on-surface-variant">主机</td>
                    <td className="px-4 py-2 text-on-surface font-mono">{parsedUrl.host}</td>
                    <td className="px-2"><CopyButton text={parsedUrl.host} /></td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="px-4 py-2 text-on-surface-variant">路径</td>
                    <td className="px-4 py-2 text-on-surface font-mono">{parsedUrl.pathname}</td>
                    <td className="px-2"><CopyButton text={parsedUrl.pathname} /></td>
                  </tr>
                  {parsedUrl.hash && (
                    <tr className="border-b border-border-light">
                      <td className="px-4 py-2 text-on-surface-variant">Hash</td>
                      <td className="px-4 py-2 text-on-surface font-mono">{parsedUrl.hash}</td>
                      <td className="px-2"><CopyButton text={parsedUrl.hash} /></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {params.length > 0 && (
              <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 overflow-hidden">
                <div className="px-4 py-2 border-b border-outline-variant/30 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  查询参数
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="text-left px-4 py-2 text-on-surface-variant font-medium">Key</th>
                      <th className="text-left px-4 py-2 text-on-surface-variant font-medium">Value</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p, i) => (
                      <tr key={i} className="border-b border-border-light last:border-b-0">
                        <td className="px-4 py-2 text-primary font-mono">{p.key}</td>
                        <td className="px-4 py-2 text-on-surface font-mono break-all">{p.value}</td>
                        <td className="px-2"><CopyButton text={`${p.key}=${p.value}`} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
