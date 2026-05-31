import { useState, useMemo, useCallback } from 'react';
import { Regex, ChevronDown } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { matchRegex, COMMON_PATTERNS, type MatchResult } from './utils';

export default function RegexTester() {
  const [text, setText] = usePersistInput('regex-tester');
  const [pattern, setPattern] = usePersistInput('regex-tester-pattern', '');
  const [flags, setFlags] = useState('g');
  const [showTemplates, setShowTemplates] = useState(false);

  const toggleFlag = useCallback((flag: string) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  }, []);

  const result = useMemo(() => {
    if (!pattern) return null;
    return matchRegex(pattern, flags, text);
  }, [pattern, flags, text]);

  const matches: MatchResult[] = Array.isArray(result) ? result : [];
  const error = result && 'error' in result ? result.error : null;

  const highlightedText = useMemo(() => {
    if (!pattern || error || matches.length === 0) return null;
    const parts: { text: string; matched: boolean }[] = [];
    let lastIndex = 0;
    for (const m of matches) {
      if (m.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, m.index), matched: false });
      }
      parts.push({ text: m.match, matched: true });
      lastIndex = m.index + m.match.length;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), matched: false });
    }
    return parts;
  }, [text, matches, pattern, error]);

  const matchesText = matches.map(m => m.match).join('\n');

  const applyTemplate = useCallback((t: typeof COMMON_PATTERNS[number]) => {
    setPattern(t.pattern);
    setFlags(t.flags);
    setShowTemplates(false);
  }, [setPattern]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Regex className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">正则表达式测试器</h2>
          <p className="text-sm text-on-surface-variant">实时测试正则表达式匹配</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
            className="w-full px-3 py-1.5 text-sm rounded-md bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono"
          />
        </div>
        <div className="flex items-center gap-1">
          {['g', 'i', 'm', 's'].map(flag => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={cn(
                'px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors',
                flags.includes(flag)
                  ? 'bg-primary text-on-primary shadow-clay'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {flag}
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            常用模板
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showTemplates && (
            <div className="absolute right-0 top-full mt-1 z-10 w-40 rounded-md bg-surface-container-lowest border border-outline-variant/30 shadow-lg py-1">
              {COMMON_PATTERNS.map(t => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">测试文本</div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入测试文本..."
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0 overflow-auto">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              匹配结果
              {matches.length > 0 && (
                <span className="ml-2 text-primary">{matches.length} 个匹配</span>
              )}
            </div>
            {matchesText && <CopyButton text={matchesText} />}
          </div>

          {error && (
            <div className="px-3 py-2 rounded-md bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          {highlightedText && (
            <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-mono text-sm text-on-surface break-all">
              {highlightedText.map((part, i) =>
                part.matched ? (
                  <span key={i} className="bg-primary/30 text-primary rounded px-0.5">{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          )}

          {matches.length > 0 && (
            <div className="flex flex-col gap-1 overflow-auto">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-sm"
                >
                  <span className="text-outline font-mono shrink-0">#{i + 1}</span>
                  <span className="text-primary font-mono break-all">{m.match}</span>
                  <span className="text-outline font-mono shrink-0">idx:{m.index}</span>
                  {m.groups && Object.keys(m.groups).length > 0 && (
                    <span className="text-on-surface-variant font-mono text-xs">
                      {JSON.stringify(m.groups)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!error && !highlightedText && pattern && (
            <div className="px-3 py-2 text-sm text-outline">无匹配结果</div>
          )}
        </div>
      </div>
    </div>
  );
}
