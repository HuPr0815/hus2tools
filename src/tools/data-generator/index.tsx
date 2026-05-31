import { useState } from 'react';
import { Shuffle, CheckCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import { cn } from '@/lib/utils';
import { generateBatch, toJSON, toCSV, type DataType } from './utils';

const DATA_TYPES = [
  { id: 'phone', label: '手机号' },
  { id: 'idcard', label: '身份证' },
  { id: 'email', label: '邮箱' },
  { id: 'name', label: '姓名' },
  { id: 'address', label: '地址' },
  { id: 'company', label: '公司' },
];

const OUTPUT_FORMATS = ['JSON', 'CSV', 'SQL'];

export default function DataGeneratorTool() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['phone', 'name']);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('JSON');
  const [output, setOutput] = useState('');

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selectedTypes.length === 0) return;
    const types = selectedTypes.filter((t): t is DataType => ['phone', 'idcard', 'email', 'name', 'address', 'company'].includes(t));
    const data = generateBatch(types, count);
    if (format === 'JSON') {
      setOutput(toJSON(data));
    } else if (format === 'CSV') {
      setOutput(toCSV(data));
    } else {
      const sqlValues = data.map(row => `('${Object.values(row).join("', '")}')`).join(',\n');
      setOutput(`INSERT INTO table_name (${Object.keys(data[0] || {}).join(', ')}) VALUES\n${sqlValues};`);
    }
  };

  return (
    <BasicToolLayout
      title="模拟数据生成"
      description="生成手机号、身份证、邮箱等模拟数据"
      icon={<Shuffle className="w-7 h-7" />}
      resultSection={
        output ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                输出结果
              </span>
              <div className="flex gap-2">
                <CopyButton text={output} />
              </div>
            </div>
            <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[120px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
              <CodeEditor
                value={output}
                language={format === 'JSON' ? 'json' : format === 'SQL' ? 'sql' : undefined}
                readOnly
                height="200px"
              />
            </div>
          </div>
        ) : null
      }
      showResult={!!output}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">数据类型</label>
        <div className="flex flex-wrap gap-2">
          {DATA_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={cn(
                'px-4 py-2 rounded-2xl text-sm font-medium transition-all clay-button',
                selectedTypes.includes(type.id)
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClayFieldInput
          label="数量"
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
        <div className="flex flex-col items-start gap-2 w-full">
          <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">输出格式</label>
          <div className="flex gap-2 w-full">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'flex-1 px-3 py-3 rounded-2xl text-sm font-medium transition-all clay-button',
                  format === f
                    ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                    : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ClayButton variant="primary" size="lg" icon={<Shuffle className="w-5 h-5" />} onClick={handleGenerate} disabled={selectedTypes.length === 0}>
        生成数据
      </ClayButton>
    </BasicToolLayout>
  );
}
