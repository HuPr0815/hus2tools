import { useState, useRef } from 'react';
import { Binary, Upload, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayInput from '@/components/shared/ClayInput';
import ClayButton from '@/components/shared/ClayButton';
import ClaySegmentedControl from '@/components/shared/ClaySegmentedControl';
import { usePersistInput } from '@/hooks/usePersistInput';
import { encodeBase64, decodeBase64 } from './utils';

export default function Base64() {
  const [input, setInput, _clearInput] = usePersistInput('base64');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    if (mode === 'encode') {
      setOutput(encodeBase64(input));
    } else {
      const decoded = decodeBase64(input);
      setOutput(typeof decoded === 'string' ? decoded : decoded.error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setOutput(base64);
    };
    reader.readAsDataURL(file);
  };

  const modeOptions: { label: string; value: 'encode' | 'decode' }[] = [
    { label: '编码', value: 'encode' },
    { label: '解码', value: 'decode' },
  ];

  return (
    <BasicToolLayout
      title="Base64 编码/解码"
      description="对文本进行 Base64 编码或解码"
      icon={<Binary className="w-7 h-7" />}
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
            <pre className="whitespace-pre-wrap"><code>{output || '结果将显示在这里...'}</code></pre>
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

      <ClayButton
        variant="secondary"
        size="md"
        icon={<Upload className="w-4 h-4" />}
        onClick={() => fileInputRef.current?.click()}
      >
        上传文件
      </ClayButton>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />

      <ClayInput
        label="输入"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64 字符串...'}
        rows={4}
        className="min-h-[80px] md:min-h-[100px]"
      />

      <ClayButton variant="primary" size="lg" icon={<Binary className="w-5 h-5" />} onClick={handleConvert}>
        {mode === 'encode' ? '编码' : '解码'}
      </ClayButton>
    </BasicToolLayout>
  );
}
