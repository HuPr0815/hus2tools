import { useState, useCallback, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { jsonToYaml, yamlToJson } from './utils';

type Direction = 'json2yaml' | 'yaml2json';

export default function JsonYaml() {
  const [jsonInput, setJsonInput, clearJson] = usePersistInput('json-yaml:json');
  const [yamlInput, setYamlInput, clearYaml] = usePersistInput('json-yaml:yaml');
  const [jsonError, setJsonError] = useState('');
  const [yamlError, setYamlError] = useState('');
  const [direction, setDirection] = useState<Direction>('json2yaml');

  const handleJsonToYaml = useCallback(() => {
    if (!jsonInput.trim()) return;
    setJsonError('');
    setYamlError('');
    const result = jsonToYaml(jsonInput);
    if (typeof result === 'object') {
      setJsonError(result.error);
    } else {
      setYamlInput(result);
    }
  }, [jsonInput, setYamlInput]);

  const handleYamlToJson = useCallback(() => {
    if (!yamlInput.trim()) return;
    setJsonError('');
    setYamlError('');
    const result = yamlToJson(yamlInput);
    if (typeof result === 'object') {
      setYamlError(result.error);
    } else {
      setJsonInput(result);
    }
  }, [yamlInput, setJsonInput]);

  const handleClear = useCallback(() => {
    clearJson();
    clearYaml();
    setJsonError('');
    setYamlError('');
  }, [clearJson, clearYaml]);

  useEffect(() => {
    if (!jsonInput.trim()) return;
    if (direction === 'json2yaml') {
      setJsonError('');
      setYamlError('');
      const result = jsonToYaml(jsonInput);
      if (typeof result === 'object') {
        setJsonError(result.error);
      } else {
        setYamlInput(result);
      }
    }
  }, [jsonInput, direction, setYamlInput]);

  useEffect(() => {
    if (!yamlInput.trim()) return;
    if (direction === 'yaml2json') {
      setJsonError('');
      setYamlError('');
      const result = yamlToJson(yamlInput);
      if (typeof result === 'object') {
        setYamlError(result.error);
      } else {
        setJsonInput(result);
      }
    }
  }, [yamlInput, direction, setJsonInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <ArrowRightLeft className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">JSON ↔ YAML 转换</h2>
          <p className="text-sm text-text-secondary">JSON 和 YAML 双向转换</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setDirection('json2yaml')}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md transition-colors',
            direction === 'json2yaml'
              ? 'bg-primary text-white'
              : 'bg-bg-tertiary text-text-secondary hover:bg-border'
          )}
        >
          JSON → YAML
        </button>
        <button
          onClick={() => setDirection('yaml2json')}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md transition-colors',
            direction === 'yaml2json'
              ? 'bg-primary text-white'
              : 'bg-bg-tertiary text-text-secondary hover:bg-border'
          )}
        >
          YAML → JSON
        </button>
        <button
          onClick={direction === 'json2yaml' ? handleJsonToYaml : handleYamlToJson}
          className="px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          转换
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">JSON</div>
            {jsonInput && <CopyButton text={jsonInput} />}
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={jsonInput}
              onChange={setJsonInput}
              language="json"
              placeholder="输入 JSON..."
            />
          </div>
          {jsonError && (
            <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
              {jsonError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">YAML</div>
            {yamlInput && <CopyButton text={yamlInput} />}
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={yamlInput}
              onChange={setYamlInput}
              language="yaml"
              placeholder="输入 YAML..."
            />
          </div>
          {yamlError && (
            <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
              {yamlError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
