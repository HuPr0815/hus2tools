import { useState, useCallback } from 'react';
import { FileCode2 } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { encodeBase64, decodeBase64 } from './utils';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [input, setInput, clearInput] = usePersistInput('base64');
  const [mode, setMode] = useState<Mode>('encode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleConvert = useCallback(() => {
    if (!input) return;
    setError('');
    if (mode === 'encode') {
      try {
        setOutput(encodeBase64(input));
      } catch (e) {
        setError((e as Error).message);
        setOutput('');
      }
    } else {
      const result = decodeBase64(input);
      if (typeof result === 'string') {
        setOutput(result);
      } else {
        setError(result.error);
        setOutput('');
      }
    }
  }, [input, mode]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setOutput('');
    setError('');
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <FileCode2 className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">Base64 编解码</h2>
          <p className="text-sm text-on-surface-variant">编码和解码 Base64 数据</p>
        </div>
      </div>

      <div className="flex gap-2">
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
          onClick={clearInput}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {mode === 'encode' ? '原始文本' : 'Base64 字符串'}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'}
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              {mode === 'encode' ? 'Base64 结果' : '解码结果'}
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
