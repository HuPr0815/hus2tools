import { useState } from 'react';
import { Globe, Send, Trash2, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import { cn } from '@/lib/utils';
import { sendRequest } from './utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type RequestTab = 'headers' | 'body' | 'auth';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function ApiDebugger() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<RequestTab>('headers');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    body: string;
    time: number;
  } | null>(null);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers];
    updated[index][field] = val;
    setHeaders(updated);
  };

  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const headerObj: Record<string, string> = {};
      headers.forEach(h => { if (h.key) headerObj[h.key] = h.value; });
      if (authToken) headerObj['Authorization'] = `Bearer ${authToken}`;
      const res = await sendRequest({ method, url, headers: headerObj, body: ['GET', 'HEAD'].includes(method) ? '' : body });
      setResponse(res);
    } catch (e) {
      setResponse({
        status: 0,
        headers: {},
        body: `请求失败: ${e instanceof Error ? e.message : '未知错误'}`,
        time: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setBody('');
    setHeaders([{ key: '', value: '' }]);
    setAuthToken('');
    setResponse(null);
  };

  const statusColor = response
    ? response.status >= 200 && response.status < 300
      ? 'text-success'
      : response.status >= 400
        ? 'text-error'
        : 'text-warning'
    : '';

  return (
    <BasicToolLayout
      title="API 调试器"
      description="发送 HTTP 请求并查看响应"
      icon={<Globe className="w-7 h-7" />}
      resultSection={
        response ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
                <CheckCircle className="w-5 h-5" />
                响应
              </span>
              <div className="flex gap-2">
                <CopyButton text={response.body} />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4 px-4 py-2 rounded-2xl bg-surface dark:bg-black/40 shadow-clay-inset">
              <span className={cn('text-sm font-bold', statusColor)}>{response.status}</span>
              <span className="text-xs text-outline">{response.time}ms</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-outline-variant shadow-clay-inset">
              <CodeEditor
                value={response.body}
                language="json"
                readOnly
                height="200px"
              />
            </div>
          </div>
        ) : null
      }
      showResult={response !== null}
    >
      <div className="flex items-center justify-end gap-2">
        <ClayButton variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} onClick={handleClear}>
          清空
        </ClayButton>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex rounded-2xl bg-surface-container-low dark:bg-black/20 shadow-clay-inset overflow-hidden">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-all clay-button',
                method === m
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <ClayFieldInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入请求 URL..."
          prefix={<Globe className="w-4 h-4" />}
          className="flex-1"
        />
        <ClayButton
          variant="primary"
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          onClick={handleSend}
          disabled={loading || !url.trim()}
        >
          发送
        </ClayButton>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {(['headers', 'body', 'auth'] as RequestTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all clay-button capitalize',
                activeTab === tab
                  ? 'bg-clay-blue-light text-clay-blue-deep shadow-clay'
                  : 'text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-black/20'
              )}
            >
              {tab === 'headers' ? '请求头' : tab === 'body' ? '请求体' : '认证'}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'headers' && (
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant shadow-clay-inset">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ClayFieldInput
                    size="sm"
                    value={h.key}
                    onChange={(e) => handleHeaderChange(i, 'key', e.target.value)}
                    placeholder="Header 名称"
                  />
                  <ClayFieldInput
                    size="sm"
                    value={h.value}
                    onChange={(e) => handleHeaderChange(i, 'value', e.target.value)}
                    placeholder="Header 值"
                  />
                  <button
                    onClick={() => handleRemoveHeader(i)}
                    className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHeader}
                className="flex items-center gap-1 self-start px-3 py-1 rounded-lg text-xs text-primary dark:text-clay-green-main hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3 h-3" />
                添加请求头
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant shadow-clay-inset">
              <CodeEditor
                value={body}
                onChange={setBody}
                language="json"
                height="120px"
                placeholder="输入请求体 JSON..."
              />
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="p-3 rounded-2xl bg-surface dark:bg-black/40 border border-outline-variant shadow-clay-inset">
              <ClayFieldInput
                label="Bearer Token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="输入 Bearer Token..."
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </BasicToolLayout>
  );
}
