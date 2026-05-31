import { useState, useMemo, useCallback } from 'react';
import { Search, Copy, Check, Braces } from 'lucide-react';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';

const EXAMPLE_JSON = JSON.stringify(
  {
    store: {
      book: [
        {
          category: 'reference',
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: 8.95,
        },
        {
          category: 'fiction',
          author: 'Evelyn Waugh',
          title: 'Sword of Honour',
          price: 12.99,
        },
        {
          category: 'fiction',
          author: 'Herman Melville',
          title: 'Moby Dick',
          isbn: '0-553-21311-3',
          price: 8.99,
        },
        {
          category: 'fiction',
          author: 'J. R. R. Tolkien',
          title: 'The Lord of the Rings',
          isbn: '0-395-19395-8',
          price: 22.99,
        },
      ],
      bicycle: {
        color: 'red',
        price: 19.95,
      },
    },
  },
  null,
  2
);

const EXAMPLE_PATHS = [
  { label: '$', path: '$' },
  { label: '$.store', path: '$.store' },
  { label: '$.store.book[*]', path: '$.store.book[*]' },
  { label: '$..author', path: '$..author' },
  { label: '$.store.book[0]', path: '$.store.book[0]' },
  { label: '$.store.book[?(@.price<10)]', path: '$.store.book[?(@.price<10)]' },
  { label: '$..book[?(@.isbn)]', path: '$..book[?(@.isbn)]' },
  { label: '$.store.*', path: '$.store.*' },
];

type JsonPathToken =
  | { type: 'root' }
  | { type: 'child'; key: string }
  | { type: 'index'; value: number }
  | { type: 'wildcard' }
  | { type: 'recursive'; key: string }
  | { type: 'filter'; key: string; operator: string; value: string };

function parseJsonPath(path: string): JsonPathToken[] | null {
  const tokens: JsonPathToken[] = [];
  let i = 0;

  if (path[i] !== '$') return null;
  tokens.push({ type: 'root' });
  i++;

  while (i < path.length) {
    if (path[i] === '.' && path[i + 1] === '.') {
      i += 2;
      let key = '';
      if (path[i] === '[') {
        i++;
        if (path[i] === '*') {
          i++;
          if (path[i] === ']') i++;
          tokens.push({ type: 'recursive', key: '*' });
          continue;
        }
        if (path[i] === '?') {
          const filterResult = parseFilter(path, i);
          if (!filterResult) return null;
          tokens.push(filterResult.token);
          i = filterResult.endIndex;
          continue;
        }
        if (path[i] === "'") {
          i++;
          while (i < path.length && path[i] !== "'") {
            key += path[i];
            i++;
          }
          i++;
          if (path[i] === ']') i++;
          tokens.push({ type: 'recursive', key });
          continue;
        }
        return null;
      }
      while (i < path.length && path[i] !== '.' && path[i] !== '[') {
        key += path[i];
        i++;
      }
      if (!key) return null;
      tokens.push({ type: 'recursive', key });
      continue;
    }

    if (path[i] === '.') {
      i++;
      let key = '';
      while (i < path.length && path[i] !== '.' && path[i] !== '[') {
        key += path[i];
        i++;
      }
      if (!key) return null;
      tokens.push({ type: 'child', key });
      continue;
    }

    if (path[i] === '[') {
      i++;
      if (path[i] === '*') {
        i++;
        if (path[i] === ']') i++;
        tokens.push({ type: 'wildcard' });
        continue;
      }
      if (path[i] === '?') {
        const filterResult = parseFilter(path, i);
        if (!filterResult) return null;
        tokens.push(filterResult.token);
        i = filterResult.endIndex;
        continue;
      }
      if (path[i] === "'") {
        i++;
        let key = '';
        while (i < path.length && path[i] !== "'") {
          key += path[i];
          i++;
        }
        i++;
        if (path[i] === ']') i++;
        tokens.push({ type: 'child', key });
        continue;
      }
      let numStr = '';
      while (i < path.length && path[i] !== ']') {
        numStr += path[i];
        i++;
      }
      if (path[i] === ']') i++;
      const num = parseInt(numStr, 10);
      if (isNaN(num)) return null;
      tokens.push({ type: 'index', value: num });
      continue;
    }

    return null;
  }

  return tokens;
}

function parseFilter(
  path: string,
  startIndex: number
): { token: JsonPathToken; endIndex: number } | null {
  let i = startIndex;
  if (path[i] !== '?') return null;
  i++;
  if (path[i] !== '(') return null;
  i++;
  if (path[i] !== '@') return null;
  i++;
  if (path[i] !== '.') return null;
  i++;

  let key = '';
  while (i < path.length && /[a-zA-Z0-9_]/.test(path[i])) {
    key += path[i];
    i++;
  }
  if (!key) return null;

  let operator = '';
  while (i < path.length && /[<>=!]/.test(path[i])) {
    operator += path[i];
    i++;
  }
  if (!operator) return null;

  let value = '';
  while (i < path.length && path[i] !== ')') {
    value += path[i];
    i++;
  }
  value = value.trim();
  if (path[i] !== ')') return null;
  i++;
  if (path[i] !== ']') return null;
  i++;

  return {
    token: { type: 'filter', key, operator, value },
    endIndex: i,
  };
}

function evaluateJsonPath(data: unknown, tokens: JsonPathToken[]): unknown[] {
  let current: unknown[] = [data];

  for (const token of tokens) {
    switch (token.type) {
      case 'root':
        break;

      case 'child': {
        const next: unknown[] = [];
        for (const item of current) {
          if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            const obj = item as Record<string, unknown>;
            if (token.key in obj) {
              next.push(obj[token.key]);
            }
          }
        }
        current = next;
        break;
      }

      case 'index': {
        const next: unknown[] = [];
        for (const item of current) {
          if (Array.isArray(item) && token.value >= 0 && token.value < item.length) {
            next.push(item[token.value]);
          }
        }
        current = next;
        break;
      }

      case 'wildcard': {
        const next: unknown[] = [];
        for (const item of current) {
          if (Array.isArray(item)) {
            next.push(...item);
          } else if (item !== null && typeof item === 'object') {
            next.push(...Object.values(item as Record<string, unknown>));
          }
        }
        current = next;
        break;
      }

      case 'recursive': {
        const next: unknown[] = [];
        for (const item of current) {
          collectRecursive(item, token.key, next);
        }
        current = next;
        break;
      }

      case 'filter': {
        const next: unknown[] = [];
        for (const item of current) {
          if (Array.isArray(item)) {
            for (const element of item) {
              if (
                element !== null &&
                typeof element === 'object' &&
                !Array.isArray(element)
              ) {
                const obj = element as Record<string, unknown>;
                if (token.key in obj && compareValues(obj[token.key], token.operator, token.value)) {
                  next.push(element);
                }
              }
            }
          }
        }
        current = next;
        break;
      }
    }
  }

  return current;
}

function collectRecursive(data: unknown, key: string, results: unknown[]) {
  if (data === null || data === undefined) return;

  if (Array.isArray(data)) {
    if (key === '*') {
      results.push(...data);
    }
    for (const item of data) {
      collectRecursive(item, key, results);
    }
    return;
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (key === '*' || key in obj) {
      if (key === '*') {
        results.push(...Object.values(obj));
      } else {
        results.push(obj[key]);
      }
    }
    for (const value of Object.values(obj)) {
      collectRecursive(value, key, results);
    }
  }
}

function compareValues(actual: unknown, operator: string, expectedStr: string): boolean {
  if (typeof actual === 'number') {
    const expected = Number(expectedStr);
    if (isNaN(expected)) return false;
    switch (operator) {
      case '<': return actual < expected;
      case '>': return actual > expected;
      case '<=': return actual <= expected;
      case '>=': return actual >= expected;
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      default: return false;
    }
  }

  if (typeof actual === 'string') {
    let expected: string = expectedStr;
    if (
      (expectedStr.startsWith("'") && expectedStr.endsWith("'")) ||
      (expectedStr.startsWith('"') && expectedStr.endsWith('"'))
    ) {
      expected = expectedStr.slice(1, -1);
    }
    switch (operator) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      default: return false;
    }
  }

  if (typeof actual === 'boolean') {
    const expected = expectedStr === 'true';
    switch (operator) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      default: return false;
    }
  }

  return false;
}

export default function JsonPath() {
  const [jsonInput, setJsonInput, clearJsonInput] = usePersistInput('json-path');
  const [pathInput, setPathInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const parsedResult = useMemo(() => {
    if (!jsonInput.trim() || !pathInput.trim()) return null;

    let data: unknown;
    try {
      data = JSON.parse(jsonInput);
    } catch (e) {
      return { error: `JSON 解析错误: ${(e as Error).message}` };
    }

    const tokens = parseJsonPath(pathInput.trim());
    if (!tokens) {
      return { error: '无效的 JSONPath 表达式' };
    }

    try {
      const results = evaluateJsonPath(data, tokens);
      return { results };
    } catch (e) {
      return { error: `执行错误: ${(e as Error).message}` };
    }
  }, [jsonInput, pathInput]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {}
  }, [jsonInput, setJsonInput]);

  const handleLoadExample = useCallback(() => {
    setJsonInput(EXAMPLE_JSON);
  }, [setJsonInput]);

  const handleCopyResult = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {}
  }, []);

  const results = parsedResult && 'results' in parsedResult ? parsedResult.results : [];
  const error = parsedResult && 'error' in parsedResult ? parsedResult.error : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">JSONPath 查询</h2>
          <p className="text-sm text-text-secondary">使用 JSONPath 表达式查询 JSON 数据</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleFormat}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          格式化
        </button>
        <button
          onClick={handleLoadExample}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-primary transition-colors"
        >
          加载示例
        </button>
        <button
          onClick={clearJsonInput}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary hover:bg-border text-text-secondary transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">JSON 输入</div>
          <textarea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            placeholder="粘贴 JSON 数据..."
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-clay-sm bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono resize-none shadow-clay-inset transition-colors ease-spring"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            查询路径
          </div>
          <input
            type="text"
            value={pathInput}
            onChange={e => setPathInput(e.target.value)}
            placeholder="输入 JSONPath 表达式，如 $.store.book[*]"
            className="w-full px-3 py-1.5 text-sm rounded-clay-sm bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono shadow-clay-inset transition-colors ease-spring"
          />

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PATHS.map(ep => (
              <button
                key={ep.path}
                onClick={() => setPathInput(ep.path)}
                className={cn(
                  'px-2 py-1 text-xs font-mono rounded-md transition-colors ease-spring',
                  pathInput === ep.path
                    ? 'bg-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-border'
                )}
              >
                {ep.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              查询结果
              {results.length > 0 && (
                <span className="ml-2 text-primary">{results.length} 个匹配</span>
              )}
            </div>
            {results.length > 0 && (
              <CopyButton text={JSON.stringify(results, null, 2)} />
            )}
          </div>

          {error && (
            <div className="px-3 py-2 rounded-clay-sm bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-auto">
            {results.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.map((item, index) => (
                  <div
                    key={index}
                    className="relative group px-3 py-2 rounded-clay-sm bg-bg-secondary border border-border text-sm font-mono text-text-primary break-all"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0">#{index + 1}</span>
                      <pre className="whitespace-pre-wrap break-all text-text-primary text-sm flex-1">
                        {typeof item === 'string'
                          ? item
                          : JSON.stringify(item, null, 2)}
                      </pre>
                      <button
                        onClick={() =>
                          handleCopyResult(
                            typeof item === 'string' ? item : JSON.stringify(item, null, 2),
                            index
                          )
                        }
                        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ease-spring text-text-secondary hover:text-text-primary"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !error &&
              jsonInput.trim() &&
              pathInput.trim() && (
                <div className="px-3 py-2 text-sm text-text-muted">无匹配结果</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
