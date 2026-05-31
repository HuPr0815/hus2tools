import { useState } from 'react';
import { ArrowLeftRight, CheckCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { jsonToYaml, yamlToJson } from './utils';

type Direction = 'json-to-yaml' | 'yaml-to-json';

export default function JsonYamlTool() {
  const [direction, setDirection] = useState<Direction>('json-to-yaml');
  const [input, setInput, clearInput] = usePersistInput('json-yaml');
  const [output, setOutput] = useState('');

  const handleConvert = () => {
    if (direction === 'json-to-yaml') {
      const result = jsonToYaml(input);
      setOutput(typeof result === 'string' ? result : result.error);
    } else {
      const result = yamlToJson(input);
      setOutput(typeof result === 'string' ? result : result.error);
    }
  };

  const handleSwap = () => {
    setDirection((prev) => (prev === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'));
    setInput(output);
    setOutput(input);
  };

  return (
    <BasicToolLayout
      title="JSON ↔ YAML 转换"
      description="在 JSON 和 YAML 格式之间互相转换"
      icon={<ArrowLeftRight className="w-7 h-7" />}
      resultSection={
        output ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                {direction === 'json-to-yaml' ? 'YAML 输出' : 'JSON 输出'}
              </span>
              <div className="flex gap-2">
                <CopyButton text={output} />
              </div>
            </div>
            <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[120px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
              <CodeEditor
                value={output}
                language={direction === 'json-to-yaml' ? 'yaml' : 'json'}
                readOnly
                placeholder="转换结果..."
                height="200px"
              />
            </div>
          </div>
        ) : null
      }
      showResult={!!output}
    >
      <div className="w-full grid grid-cols-2 gap-4">
        <button
          onClick={() => setDirection('json-to-yaml')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            direction === 'json-to-yaml'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          JSON → YAML
        </button>
        <button
          onClick={() => setDirection('yaml-to-json')}
          className={cn(
            'py-3 rounded-2xl font-bold clay-button text-sm',
            direction === 'yaml-to-json'
              ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
              : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
          )}
        >
          YAML → JSON
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-center justify-between w-full px-4">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main">
            {direction === 'json-to-yaml' ? 'JSON 输入' : 'YAML 输入'}
          </label>
          <button
            onClick={clearInput}
            className="text-xs text-outline hover:text-error transition-colors"
          >
            清空
          </button>
        </div>
        <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <CodeEditor
            value={input}
            onChange={setInput}
            language={direction === 'json-to-yaml' ? 'json' : 'yaml'}
            placeholder={direction === 'json-to-yaml' ? '粘贴 JSON...' : '粘贴 YAML...'}
            height="100%"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleConvert}
          className="group relative flex-1 py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <ArrowLeftRight className="w-5 h-5" />
            转换
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={handleSwap}
          className="px-6 py-5 rounded-full bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all clay-button"
        >
          交换
        </button>
      </div>
    </BasicToolLayout>
  );
}
