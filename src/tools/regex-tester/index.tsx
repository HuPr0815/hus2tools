import { useState } from 'react';
import { Regex, CheckCircle } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayInput from '@/components/shared/ClayInput';
import ClayButton from '@/components/shared/ClayButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import CopyButton from '@/components/shared/CopyButton';
import { matchRegex, type MatchResult } from './utils';

export default function RegexTester() {
  const [input, setInput, _clearInput] = usePersistInput('regex-tester');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [results, setResults] = useState<{ matches: { match: string; index: number }[]; error?: string } | null>(null);

  const handleTest = () => {
    const result = matchRegex(pattern, flags, input);
    if ('error' in result) {
      setResults({ matches: [], error: result.error });
    } else {
      setResults({ matches: result.map((m: MatchResult) => ({ match: m.match, index: m.index })) });
    }
  };

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  return (
    <BasicToolLayout
      title="正则表达式测试"
      description="测试正则表达式并查看匹配结果"
      icon={<Regex className="w-7 h-7" />}
      resultSection={
        results ? (
          results.error ? (
            <div className="px-4 py-3 rounded-2xl bg-clay-pink-light/30 text-clay-pink-deep text-sm">
              {results.error}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                  <CheckCircle className="w-5 h-5" />
                  匹配结果 ({results.matches.length} 个匹配)
                </span>
                <div className="flex gap-2">
                  <CopyButton text={results.matches.map(m => m.match).join('\n')} />
                </div>
              </div>
              {results.matches.length === 0 ? (
                <div className="bg-surface dark:bg-black/40 rounded-2xl p-6 shadow-clay-inset min-h-[80px] font-mono text-sm text-on-surface-variant dark:text-gray-300">
                  无匹配项
                </div>
              ) : (
                <div className="overflow-auto max-h-60 rounded-2xl shadow-clay-inset bg-surface dark:bg-black/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="px-4 py-2 text-left text-outline font-medium">#</th>
                        <th className="px-4 py-2 text-left text-outline font-medium">匹配</th>
                        <th className="px-4 py-2 text-left text-outline font-medium">位置</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.matches.map((m, i) => (
                        <tr key={i} className="border-b border-outline-variant last:border-0">
                          <td className="px-4 py-2 text-outline">{i + 1}</td>
                          <td className="px-4 py-2 text-on-surface font-mono">{m.match}</td>
                          <td className="px-4 py-2 text-outline">{m.index}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        ) : null
      }
      showResult={results !== null}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">正则表达式</label>
        <div className="flex items-center gap-2 w-full p-2 rounded-2xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-clay transition-all">
          <span className="text-outline text-sm font-mono px-2">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式"
            className="flex-1 text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none"
          />
          <span className="text-outline text-sm font-mono px-2">/{flags}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['g', 'i', 'm', 's'].map((flag) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            className={cn(
              'px-4 py-2 text-sm font-bold font-mono rounded-2xl spring-transition active:scale-95',
              flags.includes(flag)
                ? 'bg-clay-blue-light text-clay-blue-dark shadow-clay'
                : 'bg-surface dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30'
            )}
          >
            {flag}
          </button>
        ))}
      </div>

      <ClayInput
        label="测试文本"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入测试文本..."
        rows={4}
        className="min-h-[80px] md:min-h-[100px]"
      />

      <ClayButton variant="primary" size="lg" icon={<Regex className="w-5 h-5" />} onClick={handleTest}>
        测试
      </ClayButton>
    </BasicToolLayout>
  );
}
