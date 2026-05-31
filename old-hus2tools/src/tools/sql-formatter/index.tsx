import { useState, useCallback } from 'react';
import { Database } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { formatSql, compressSql } from './utils';

export default function SqlFormatter() {
  const [input, setInput, clearInput] = usePersistInput('sql-formatter');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState('');

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const result = formatSql(input, indentSize);
      setOutput(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, indentSize]);

  const handleCompress = useCallback(() => {
    if (!input.trim()) return;
    try {
      const result = compressSql(input);
      setOutput(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input]);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
    setError('');
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">SQL 格式化</h2>
          <p className="text-sm text-text-secondary">格式化和压缩 SQL 语句</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs text-text-secondary">缩进:</span>
          <button
            onClick={() => setIndentSize(2)}
            className={cn(
              'px-2 py-1 text-xs rounded transition-colors',
              indentSize === 2
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-border'
            )}
          >
            2空格
          </button>
          <button
            onClick={() => setIndentSize(4)}
            className={cn(
              'px-2 py-1 text-xs rounded transition-colors',
              indentSize === 4
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-border'
            )}
          >
            4空格
          </button>
        </div>
        <button
          onClick={handleFormat}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          格式化
        </button>
        <button
          onClick={handleCompress}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-primary transition-colors"
        >
          压缩
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输入</div>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="sql"
              placeholder="输入 SQL 语句..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输出</div>
            {output && <CopyButton text={output} />}
          </div>
          {error ? (
            <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
              {error}
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={output}
                language="sql"
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
