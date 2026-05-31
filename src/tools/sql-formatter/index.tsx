import { useState } from 'react';
import { Database, Trash2, CheckCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { formatSql, compressSql } from './utils';

export default function SqlFormatter() {
  const [input, setInput, clearInput] = usePersistInput('sql-formatter');
  const [output, setOutput] = useState('');

  const handleFormat = () => {
    const result = formatSql(input);
    setOutput(result);
  };

  const handleCompress = () => {
    const result = compressSql(input);
    setOutput(result);
  };

  const handleClear = () => {
    clearInput();
    setOutput('');
  };

  return (
    <BasicToolLayout
      title="SQL 格式化"
      description="格式化和压缩 SQL 语句"
      icon={<Database className="w-7 h-7" />}
      resultSection={
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
            <CodeEditor value={output} language="sql" readOnly height="200px" />
          </div>
        </div>
      }
      showResult={!!output}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleFormat}
          className="px-4 py-2 text-sm font-bold rounded-2xl bg-clay-blue-light text-clay-blue-dark shadow-clay clay-button transition-all"
        >
          格式化
        </button>
        <button
          onClick={handleCompress}
          className="px-4 py-2 text-sm font-bold rounded-2xl bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 clay-button transition-all"
        >
          压缩
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-bold rounded-2xl bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all ml-auto clay-button"
        >
          <Trash2 className="w-4 h-4 inline-block mr-1" />
          清空
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">输入</label>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <CodeEditor value={input} onChange={setInput} language="sql" height="100%" />
        </div>
      </div>

      <button
        onClick={handleFormat}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Database className="w-5 h-5" />
          格式化
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
