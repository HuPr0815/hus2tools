import { useState, useCallback } from 'react';
import { Lock } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { encryptText, decryptText, simpleXor, caesarCipher } from './utils';

type Mode = 'aes-encrypt' | 'aes-decrypt' | 'xor' | 'caesar';

const modes: { name: string; value: Mode }[] = [
  { name: 'AES加密', value: 'aes-encrypt' },
  { name: 'AES解密', value: 'aes-decrypt' },
  { name: 'XOR加密', value: 'xor' },
  { name: 'Caesar加密', value: 'caesar' },
];

export default function TextEncrypt() {
  const [input, setInput, clearInput] = usePersistInput('text-encrypt');
  const [mode, setMode] = useState<Mode>('aes-encrypt');
  const [password, setPassword] = useState('');
  const [shift, setShift] = useState(3);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setOutput('');
    setError('');
  }, []);

  const handleExecute = useCallback(async () => {
    if (!input.trim()) return;
    setError('');
    setOutput('');
    setLoading(true);

    try {
      let result = '';
      switch (mode) {
        case 'aes-encrypt':
          if (!password) {
            setError('请输入密码');
            setLoading(false);
            return;
          }
          result = await encryptText(input, password);
          break;
        case 'aes-decrypt':
          if (!password) {
            setError('请输入密码');
            setLoading(false);
            return;
          }
          result = await decryptText(input.trim(), password);
          break;
        case 'xor':
          if (!password) {
            setError('请输入密钥');
            setLoading(false);
            return;
          }
          result = simpleXor(input, password);
          break;
        case 'caesar':
          result = caesarCipher(input, shift);
          break;
      }
      setOutput(result);
    } catch (e) {
      if (mode === 'aes-decrypt') {
        setError('解密失败，请检查密码是否正确');
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [input, mode, password, shift]);

  const handleClear = useCallback(() => {
    clearInput();
    setOutput('');
    setError('');
    setPassword('');
  }, [clearInput]);

  const showPassword = mode === 'aes-encrypt' || mode === 'aes-decrypt' || mode === 'xor';
  const showShift = mode === 'caesar';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">文本加密解密</h2>
          <p className="text-sm text-text-secondary">AES-GCM / XOR / Caesar 加密与解密</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              mode === m.value
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-border'
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {showPassword && (
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {mode === 'xor' ? '密钥' : '密码'}
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'xor' ? '输入XOR密钥...' : '输入密码...'}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
            />
          </div>
        )}
        {showShift && (
          <div className="flex flex-col gap-1.5 w-32">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">偏移量</div>
            <input
              type="number"
              min={0}
              max={25}
              value={shift}
              onChange={e => setShift(Math.min(25, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary font-mono"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输入文本</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'aes-encrypt' || mode === 'xor' || mode === 'caesar'
                ? '输入要加密的文本...'
                : '输入要解密的密文...'
            }
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">输出结果</div>
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
              className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted font-mono resize-none"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleExecute}
          disabled={loading}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading
            ? '处理中...'
            : mode === 'aes-decrypt'
              ? '解密'
              : '加密'}
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>
    </div>
  );
}
