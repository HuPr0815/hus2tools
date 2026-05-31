import { useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayInput from '@/components/shared/ClayInput';
import ClayButton from '@/components/shared/ClayButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { encryptText, decryptText, simpleXor, caesarCipher } from './utils';

type Algorithm = 'aes-gcm' | 'xor' | 'caesar';

const ALGORITHMS: { key: Algorithm; label: string }[] = [
  { key: 'aes-gcm', label: 'AES-GCM' },
  { key: 'xor', label: 'XOR' },
  { key: 'caesar', label: 'Caesar' },
];

export default function TextEncrypt() {
  const [input, setInput, _clearInput] = usePersistInput('text-encrypt');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('aes-gcm');

  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    setError('');
    try {
      if (algorithm === 'aes-gcm') {
        const result = await encryptText(input, key);
        setOutput(result);
      } else if (algorithm === 'xor') {
        setOutput(simpleXor(input, key));
      } else {
        setOutput(caesarCipher(input, parseInt(key) || 3));
      }
    } catch (e) {
      setError((e as Error).message || '加密失败');
    }
  };

  const handleDecrypt = async () => {
    setError('');
    try {
      if (algorithm === 'aes-gcm') {
        const result = await decryptText(input, key);
        setOutput(result);
      } else if (algorithm === 'xor') {
        setOutput(simpleXor(input, key));
      } else {
        setOutput(caesarCipher(input, -(parseInt(key) || 3)));
      }
    } catch (e) {
      setError((e as Error).message || '解密失败');
    }
  };

  return (
    <BasicToolLayout
      title="文本加密/解密"
      description="使用不同算法对文本进行加密和解密"
      icon={<Lock className="w-7 h-7" />}
      resultSection={
        output ? (
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
              <pre className="whitespace-pre-wrap"><code>{output}</code></pre>
            </div>
          </div>
        ) : null
      }
      showResult={!!output}
    >
      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.key}
            onClick={() => setAlgorithm(algo.key)}
            className={cn(
              'py-3 rounded-2xl font-bold clay-button text-sm',
              algorithm === algo.key
                ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
            )}
          >
            {algo.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-clay-pink-light/30 text-clay-pink-deep text-sm">
          {error}
        </div>
      )}

      <ClayFieldInput
        label="密钥/密码"
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="输入密钥/密码"
      />

      <ClayInput
        label="输入"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入要加密或解密的文本..."
        rows={4}
        className="min-h-[80px] md:min-h-[100px]"
      />

      <div className="flex items-center gap-4">
        <ClayButton variant="primary" size="lg" icon={<Lock className="w-5 h-5" />} onClick={handleEncrypt}>
          加密
        </ClayButton>
        <ClayButton variant="secondary" size="lg" onClick={handleDecrypt}>
          解密
        </ClayButton>
      </div>
    </BasicToolLayout>
  );
}
