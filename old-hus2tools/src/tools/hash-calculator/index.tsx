import { useState, useCallback, useRef } from 'react';
import { Hash } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { calculateHash, calculateFileHash, md5, type HashAlgorithm } from './utils';

const algorithms: { name: string; value: HashAlgorithm | 'MD5' }[] = [
  { name: 'MD5', value: 'MD5' },
  { name: 'SHA-1', value: 'SHA-1' },
  { name: 'SHA-256', value: 'SHA-256' },
  { name: 'SHA-512', value: 'SHA-512' },
];

interface HashResult {
  algorithm: string;
  hash: string;
}

export default function HashCalculator() {
  const [input, setInput, clearInput] = usePersistInput('hash-calculator');
  const [selectedAlgos, setSelectedAlgos] = useState<Set<string>>(new Set(['MD5', 'SHA-256']));
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAlgo = useCallback((algo: string) => {
    setSelectedAlgos(prev => {
      const next = new Set(prev);
      if (next.has(algo)) next.delete(algo);
      else next.add(algo);
      return next;
    });
  }, []);

  const handleCalculate = useCallback(async () => {
    const text = input.trim();
    if (!text || selectedAlgos.size === 0) return;
    setLoading(true);
    try {
      const hashResults: HashResult[] = [];
      for (const algo of selectedAlgos) {
        if (algo === 'MD5') {
          hashResults.push({ algorithm: 'MD5', hash: md5(text) });
        } else {
          const hash = await calculateHash(text, algo as HashAlgorithm);
          hashResults.push({ algorithm: algo, hash });
        }
      }
      setResults(hashResults);
    } catch (e) {
      setResults([{ algorithm: 'Error', hash: (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }, [input, selectedAlgos]);

  const handleFileHash = useCallback(async (file: File) => {
    if (selectedAlgos.size === 0) return;
    setFileName(file.name);
    setLoading(true);
    try {
      const hashResults: HashResult[] = [];
      for (const algo of selectedAlgos) {
        if (algo === 'MD5') {
          const buffer = await file.arrayBuffer();
          const text = new TextDecoder().decode(buffer);
          hashResults.push({ algorithm: 'MD5', hash: md5(text) });
        } else {
          const hash = await calculateFileHash(file, algo as HashAlgorithm);
          hashResults.push({ algorithm: algo, hash });
        }
      }
      setResults(hashResults);
    } catch (e) {
      setResults([{ algorithm: 'Error', hash: (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }, [selectedAlgos]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileHash(file);
  }, [handleFileHash]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileHash(file);
  }, [handleFileHash]);

  const handleClear = useCallback(() => {
    clearInput();
    setResults([]);
    setFileName('');
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Hash className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">哈希计算器</h2>
          <p className="text-sm text-on-surface-variant">计算文本和文件的哈希值</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {algorithms.map(algo => (
          <label
            key={algo.value}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors',
              selectedAlgos.has(algo.value)
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-transparent'
            )}
          >
            <input
              type="checkbox"
              checked={selectedAlgos.has(algo.value)}
              onChange={() => toggleAlgo(algo.value)}
              className="sr-only"
            />
            {algo.name}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">输入文本</div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要计算哈希的文本..."
          className="w-full h-32 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCalculate}
          disabled={loading || selectedAlgos.size === 0}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring',
            (loading || selectedAlgos.size === 0) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? '计算中...' : '计算哈希'}
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {fileName ? `文件: ${fileName}` : '计算结果'}
          </div>
          <div className="flex flex-col gap-2">
            {results.map(r => (
              <div
                key={r.algorithm}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30"
              >
                <span className="text-xs font-medium text-primary w-16 shrink-0">{r.algorithm}</span>
                <span className="flex-1 text-sm font-mono text-on-surface break-all">{r.hash}</span>
                <CopyButton text={r.hash} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">文件哈希</div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex items-center justify-center h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            dragOver
              ? 'border-primary bg-primary/10'
              : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-lowest'
          )}
        >
          <div className="text-center">
            <p className="text-sm text-on-surface-variant">拖拽文件到此处或点击选择</p>
            <p className="text-xs text-outline mt-1">计算选中算法的文件哈希值</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}
