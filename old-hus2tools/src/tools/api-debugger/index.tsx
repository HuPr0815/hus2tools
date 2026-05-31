import { useState, useCallback } from 'react';
import { Send, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { sendRequest, formatResponseHeaders, tryFormatJson, type HttpMethod, type ResponseData } from './utils';

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const contentTypes = [
  { label: 'JSON', value: 'application/json' },
  { label: 'Form', value: 'application/x-www-form-urlencoded' },
  { label: 'Text', value: 'text/plain' },
];

type ResponseTab = 'body' | 'headers';

interface HeaderEntry {
  key: string;
  value: string;
}

export default function ApiDebugger() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = usePersistInput('api-debugger:url');
  const [body, setBody] = usePersistInput('api-debugger:body');
  const [contentType, setContentType] = useState('application/json');
  const [headers, setHeaders] = useState<HeaderEntry[]>([{ key: '', value: '' }]);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ResponseTab>('body');

  const showBody = !['GET', 'HEAD'].includes(method);

  const addHeader = useCallback(() => {
    setHeaders(prev => [...prev, { key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((index: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateHeader = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setHeaders(prev => prev.map((h, i) => i === index ? { ...h, [field]: val } : h));
  }, []);

  const handleSend = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResponse(null);

    const headerRecord: Record<string, string> = {};
    if (showBody && contentType) {
      headerRecord['Content-Type'] = contentType;
    }
    for (const h of headers) {
      if (h.key.trim()) {
        headerRecord[h.key.trim()] = h.value;
      }
    }

    try {
      const result = await sendRequest({
        method,
        url: url.trim(),
        headers: headerRecord,
        body,
      });
      setResponse(result);
      setActiveTab('body');
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        setError('请求超时 (30s)');
      } else {
        setError('请求失败: ' + (e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, contentType, showBody]);

  const responseLanguage = (() => {
    if (!response) return 'text';
    try {
      JSON.parse(response.body);
      return 'json';
    } catch {
      return 'text';
    }
  })();

  const formattedBody = response ? tryFormatJson(response.body) : '';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Send className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">API 调试</h2>
          <p className="text-sm text-text-secondary">轻量级 HTTP 请求调试工具</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as HttpMethod)}
          className="px-3 py-1.5 text-sm rounded-md bg-bg-tertiary border border-border text-text-primary focus:outline-none focus:border-primary"
        >
          {methods.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="输入请求 URL..."
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          className={cn(
            'px-4 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white transition-colors',
            (loading || !url.trim()) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>

      {showBody && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">请求体</div>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value)}
              className="px-2 py-0.5 text-xs rounded bg-bg-tertiary border border-border text-text-secondary focus:outline-none"
            >
              {contentTypes.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="输入请求体..."
            className="w-full h-28 px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setHeadersOpen(prev => !prev)}
          className="flex items-center gap-1 text-xs font-medium text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
        >
          请求头
          {headersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {headersOpen && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-bg-secondary border border-border">
            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={h.key}
                  onChange={e => updateHeader(i, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-2 py-1 text-sm rounded bg-bg-tertiary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                />
                <input
                  value={h.value}
                  onChange={e => updateHeader(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-sm rounded bg-bg-tertiary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                />
                <button
                  onClick={() => removeHeader(i)}
                  className="p-1 rounded hover:bg-border text-text-muted hover:text-error transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Plus className="w-3 h-3" />
              添加请求头
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn(
              'px-2 py-0.5 text-xs font-mono rounded',
              response.status < 300 ? 'bg-success/20 text-success' :
              response.status < 400 ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            )}>
              {response.status} {response.statusText}
            </span>
            <span className="text-xs text-text-muted">{response.time}ms</span>
            <span className="text-xs text-text-muted">{response.size} bytes</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('body')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                activeTab === 'body'
                  ? 'bg-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-border'
              )}
            >
              Body
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                activeTab === 'headers'
                  ? 'bg-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-border'
              )}
            >
              Headers
            </button>
            {activeTab === 'body' && <CopyButton text={formattedBody} />}
            {activeTab === 'headers' && <CopyButton text={formatResponseHeaders(response.headers)} />}
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'body' ? (
              <CodeEditor
                value={formattedBody}
                language={responseLanguage}
                readOnly
              />
            ) : (
              <div className="overflow-auto rounded-lg bg-bg-secondary border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(response.headers).map(([key, val]) => (
                      <tr key={key} className="border-b border-border-light last:border-0">
                        <td className="px-3 py-1.5 font-mono text-primary whitespace-nowrap">{key}</td>
                        <td className="px-3 py-1.5 font-mono text-text-primary break-all">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
