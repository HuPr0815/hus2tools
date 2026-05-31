import { useState, useCallback } from 'react';
import { Braces, CheckCircle2, XCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { formatJson, compressJson, validateJson } from './utils';

type ValidationResult = { valid: true } | { valid: false; error: string; suggestion?: string };

export default function JsonFormatter() {
  const [input, setInput, clearInput] = usePersistInput('json-formatter');
  const [output, setOutput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleFormat = useCallback((indent: number) => {
    try {
      const result = formatJson(input, indent);
      setOutput(result);
      setValidation({ valid: true });
    } catch (e) {
      setValidation({ valid: false, error: (e as Error).message });
      setOutput('');
    }
  }, [input]);

  const handleCompress = useCallback(() => {
    try {
      const result = compressJson(input);
      setOutput(result);
      setValidation({ valid: true });
    } catch (e) {
      setValidation({ valid: false, error: (e as Error).message });
      setOutput('');
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    const result = validateJson(input);
    setValidation(result);
  }, [input]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text');
    setTimeout(() => {
      try {
        const result = formatJson(pasted, 2);
        setOutput(result);
        setValidation({ valid: true });
      } catch {}
    }, 0);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Braces className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">JSON 格式化</h2>
          <p className="text-sm text-text-secondary">格式化、压缩和校验 JSON 数据</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFormat(2)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          格式化 (2空格)
        </button>
        <button
          onClick={() => handleFormat(4)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          格式化 (4空格)
        </button>
        <button
          onClick={handleCompress}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-primary transition-colors"
        >
          压缩
        </button>
        <button
          onClick={handleValidate}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-primary transition-colors"
        >
          校验
        </button>
        <button
          onClick={clearInput}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输入</div>
          <div className="flex-1 min-h-0" onPaste={handlePaste}>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="粘贴 JSON 数据..."
            />
          </div>
          {validation && (
            <div
              className={cn(
                'flex items-start gap-2 px-3 py-2 rounded-md text-sm',
                validation.valid
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              )}
            >
              {validation.valid ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <div>
                <span>{validation.valid ? 'JSON 格式有效' : ('error' in validation ? validation.error : '')}</span>
                {'suggestion' in validation && validation.suggestion && (
                  <p className="mt-1 text-xs opacity-80">💡 {validation.suggestion}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输出</div>
            {output && <CopyButton text={output} />}
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={output}
              language="json"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
