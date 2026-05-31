import { useState, useMemo, useCallback } from 'react';
import { Languages } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { textToUnicode, unicodeToText, charInfo } from './utils';

type Mode = 'encode' | 'decode';
type Format = 'unicode' | 'html' | 'css' | 'js';

const FORMATS: { key: Format; label: string }[] = [
  { key: 'unicode', label: '\\u 格式' },
  { key: 'html', label: 'HTML 实体' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JS' },
];

export default function UnicodeConverter() {
  const [input, setInput, clearInput] = usePersistInput('unicode-converter');
  const [mode, setMode] = useState<Mode>('encode');
  const [format, setFormat] = useState<Format>('unicode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const charDetail = useMemo(() => {
    if (mode === 'encode' && input.length === 1) {
      return charInfo(input);
    }
    return null;
  }, [input, mode]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setOutput('');
    setError('');
  }, []);

  const handleConvert = useCallback(() => {
    if (!input) return;
    setError('');
    setOutput('');
    if (mode === 'encode') {
      try {
        setOutput(textToUnicode(input, format));
      } catch (e) {
        setError((e as Error).message);
      }
    } else {
      const result = unicodeToText(input);
      if (typeof result === 'string') {
        setOutput(result);
      } else {
        setError(result.error);
      }
    }
  }, [input, mode, format]);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
    setError('');
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Languages className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">Unicode 转换</h2>
          <p className="text-sm text-on-surface-variant">文本与 Unicode 编码互转</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
        {mode === 'encode' && FORMATS.map(f => (
          <button
            key={f.key}
            onClick={() => setFormat(f.key)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              format === f.key
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {f.label}
          </button>
        ))}
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

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {mode === 'encode' ? '原始文本' : 'Unicode 编码'}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 Unicode 编码（如 \\u4f60\\u597d）...'}
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              {mode === 'encode' ? 'Unicode 结果' : '解码结果'}
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

      {charDetail && (
        <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 p-3">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2">字符信息</div>
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: '字符', value: charDetail.char },
              { label: '码位', value: String(charDetail.code) },
              { label: '十六进制', value: charDetail.hex },
              { label: 'Unicode', value: charDetail.unicode },
              { label: 'HTML', value: charDetail.html },
              { label: 'UTF-8', value: charDetail.utf8 },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-sm font-mono text-on-surface">{item.value}</div>
                <div className="text-xs text-outline">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
