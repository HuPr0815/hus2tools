import { useState, useRef } from 'react';
import { Shield, Upload, CheckCircle } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { calculateHash, calculateFileHash, md5, type HashAlgorithm } from './utils';

type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

const ALGO_MAP: Record<Algorithm, HashAlgorithm | null> = {
  md5: null,
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
};

const ALGORITHMS: { key: Algorithm; label: string }[] = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA-1' },
  { key: 'sha256', label: 'SHA-256' },
  { key: 'sha512', label: 'SHA-512' },
];

export default function HashCalculator() {
  const [input, setInput, _clearInput] = usePersistInput('hash-calculator');
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({ md5: '', sha1: '', sha256: '', sha512: '' });
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCalculate = async () => {
    try {
      const results = {} as Record<Algorithm, string>;
      for (const algo of ALGORITHMS) {
        const algoValue = ALGO_MAP[algo.key];
        if (algoValue === null) {
          results[algo.key] = md5(input);
        } else {
          results[algo.key] = await calculateHash(input, algoValue);
        }
      }
      setHashes(results);
    } catch {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setInput('');
    try {
      const results = {} as Record<Algorithm, string>;
      // MD5 - need to read as text
      const text = await file.text();
      results.md5 = md5(text);
      // SHA algorithms
      for (const algo of ALGORITHMS) {
        const algoValue = ALGO_MAP[algo.key];
        if (algoValue) {
          results[algo.key] = await calculateFileHash(file, algoValue);
        }
      }
      setHashes(results);
    } catch {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
    }
  };

  const handleClearFile = () => {
    setFileName('');
    setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <BasicToolLayout
      title="哈希计算器"
      description="计算文本的 MD5、SHA-1、SHA-256、SHA-512 哈希值"
      icon={<Shield className="w-7 h-7" />}
      resultSection={
        hashes.md5 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                哈希结果
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {ALGORITHMS.map((algo) => (
                <div key={algo.key} className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-on-surface-variant w-20 shrink-0">{algo.label}</label>
                  <div className="flex-1 px-4 py-2.5 rounded-2xl bg-surface dark:bg-black/40 shadow-clay-inset text-sm font-mono text-on-surface-variant dark:text-gray-300 truncate">
                    {hashes[algo.key] || `${algo.label} 哈希值`}
                  </div>
                  <CopyButton text={hashes[algo.key]} />
                </div>
              ))}
            </div>
          </div>
        ) : null
      }
      showResult={!!hashes.md5}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">输入文本</label>
        {fileName ? (
          <div className="w-full p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant dark:text-gray-300 truncate flex items-center gap-2">
              <Upload className="w-4 h-4 shrink-0" />
              {fileName}
            </span>
            <button
              onClick={handleClearFile}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors shrink-0 ml-2 px-2 py-1 rounded-xl bg-surface dark:bg-black/30 shadow-clay-inset"
            >
              清除文件
            </button>
          </div>
        ) : (
          <div className="w-full h-24 md:h-32 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入要计算哈希的文本..."
              className="w-full h-full text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleCalculate}
          className="group relative flex-1 py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Shield className="w-5 h-5" />
            计算
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-5 rounded-full bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:text-on-surface transition-all clay-button"
        >
          <Upload className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </BasicToolLayout>
  );
}
