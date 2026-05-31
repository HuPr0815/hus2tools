import { useState, useCallback } from 'react';
import { Code2 } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { encodeHtmlEntities, decodeHtmlEntities } from './utils';

type Mode = 'encode' | 'decode';
type EncodeMode = 'named' | 'numeric' | 'hex';

export default function HtmlEntities() {
  const [input, setInput, clearInput] = usePersistInput('html-entities');
  const [mode, setMode] = useState<Mode>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('named');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleConvert = useCallback(() => {
    if (!input) return;
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(encodeHtmlEntities(input, encodeMode));
      } else {
        setOutput(decodeHtmlEntities(input));
      }
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode, encodeMode]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setOutput('');
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
    setError('');
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Code2 className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">HTML 实体编解码</h2>
          <p className="text-sm text-on-surface-variant">HTML 实体编码和解码</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleModeChange('encode')}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md transition-colors',
            mode === 'encode'
              ? 'bg-primary text-on-primary shadow-clay'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          编码
        </button>
        <button
          onClick={() => handleModeChange('decode')}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md transition-colors',
            mode === 'decode'
              ? 'bg-primary text-on-primary shadow-clay'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          解码
        </button>
        <button
          onClick={handleConvert}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          {mode === 'encode' ? '编码' : '解码'}
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      {mode === 'encode' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-on-surface-variant mr-1">编码方式:</span>
          {([
            { value: 'named' as EncodeMode, label: '命名实体' },
            { value: 'numeric' as EncodeMode, label: '数字实体' },
            { value: 'hex' as EncodeMode, label: '十六进制' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setEncodeMode(opt.value)}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                encodeMode === opt.value
                  ? 'bg-primary text-on-primary shadow-clay'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {mode === 'encode' ? '原始文本' : 'HTML 实体'}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 HTML 实体...'}
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              {mode === 'encode' ? '编码结果' : '解码结果'}
            </div>
            {output && <CopyButton text={output} />}
          </div>
          {error ? (
            <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
              {error}
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder="结果将显示在这里..."
              className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline font-mono resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
