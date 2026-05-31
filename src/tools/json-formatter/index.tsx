import { useState } from 'react';
import { Braces, Trash2, CheckCircle, Search } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayButton from '@/components/shared/ClayButton';
import ClaySegmentedControl from '@/components/shared/ClaySegmentedControl';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { formatJson, compressJson, validateJson, queryJsonPath } from './utils';

type FormatMode = '2space' | '4space' | 'compress' | 'query';

export default function JsonFormatter() {
  const [input, setInput, clearInput] = usePersistInput('json-formatter');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<FormatMode>('2space');
  const [validation, setValidation] = useState<{ valid: true } | { valid: false; error: string; suggestion?: string } | null>(null);
  const [jsonPath, setJsonPath] = useState('');

  const handleFormat = () => {
    const validation = validateJson(input);
    setValidation(validation);
    if (!validation.valid) {
      setOutput('');
      return;
    }
    try {
      if (mode === '2space') {
        setOutput(formatJson(input, 2));
      } else if (mode === '4space') {
        setOutput(formatJson(input, 4));
      } else if (mode === 'compress') {
        setOutput(compressJson(input));
      } else if (mode === 'query') {
        if (!jsonPath.trim()) {
          setOutput('');
          return;
        }
        const result = queryJsonPath(input, jsonPath);
        if (result.error) {
          setOutput(result.error);
        } else {
          setOutput(typeof result.value === 'string' ? result.value : JSON.stringify(result.value, null, 2));
        }
      }
    } catch {
      setOutput('');
    }
  };

  const handleClear = () => {
    clearInput();
    setOutput('');
    setValidation(null);
  };

  const modeOptions: { label: string; value: FormatMode }[] = [
    { label: '2空格', value: '2space' },
    { label: '4空格', value: '4space' },
    { label: '压缩', value: 'compress' },
    { label: '查询', value: 'query' },
  ];

  return (
    <BasicToolLayout
      title="JSON 格式化"
      description="格式化、压缩、校验和查询 JSON 数据"
      icon={<Braces className="w-7 h-7" />}
      resultSection={
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
              <CheckCircle className="w-5 h-5" />
              {mode === 'query' ? '查询结果' : '输出'}
            </span>
            <div className="flex gap-2">
              <CopyButton text={output} />
            </div>
          </div>
          <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[120px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
            <CodeEditor value={output} language="json" readOnly height="200px" />
          </div>
        </div>
      }
      showResult={!!output}
    >
      <ClaySegmentedControl
        options={modeOptions}
        value={mode}
        onChange={setMode}
      />

      {mode === 'query' && (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary dark:text-clay-green-main shrink-0" />
          <input
            type="text"
            value={jsonPath}
            onChange={(e) => setJsonPath(e.target.value)}
            placeholder="输入 JSONPath 表达式，如 $.store.book[*].author"
            className="flex-1 px-4 py-3 text-sm rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      {validation && (
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm',
            validation.valid
              ? 'bg-clay-green-light/30 text-clay-green-deep'
              : 'bg-clay-pink-light/30 text-clay-pink-deep'
          )}
        >
          {validation.valid ? (
            <span>✓ JSON 格式有效</span>
          ) : (
            <div className="flex flex-col gap-1">
              <span>✗ {validation.error}</span>
              {validation.suggestion && (
                <span className="text-outline">提示: {validation.suggestion}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">输入</label>
        <div className="w-full h-24 md:h-32 p-4 rounded-2xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-clay">
          <CodeEditor value={input} onChange={setInput} language="json" height="100%" />
        </div>
      </div>

      <div className="flex gap-3">
        <ClayButton variant="primary" size="lg" icon={mode === 'query' ? <Search className="w-5 h-5" /> : <Braces className="w-5 h-5" />} onClick={handleFormat}>
          {mode === 'query' ? '查询' : '格式化'}
        </ClayButton>
        <ClayButton variant="secondary" size="md" icon={<Trash2 className="w-4 h-4" />} onClick={handleClear}>
          清空
        </ClayButton>
      </div>
    </BasicToolLayout>
  );
}
