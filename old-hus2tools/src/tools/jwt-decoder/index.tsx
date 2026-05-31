import { useState, useEffect, useCallback } from 'react';
import { KeyRound } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { usePersistInput } from '@/hooks/usePersistInput';
import { decodeJwt, type DecodedJwt } from './utils';

export default function JwtDecoder() {
  const [input, setInput, clearInput] = usePersistInput('jwt-decoder');
  const [result, setResult] = useState<DecodedJwt | { error: string } | null>(null);

  const handleDecode = useCallback(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    setResult(decodeJwt(input));
  }, [input]);

  useEffect(() => {
    if (input.trim()) {
      handleDecode();
    } else {
      setResult(null);
    }
  }, [input, handleDecode]);

  const isError = result && 'error' in result;
  const decoded = result && !isError ? result as DecodedJwt : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <KeyRound className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">JWT 解码器</h2>
          <p className="text-sm text-on-surface-variant">解码和验证 JSON Web Token</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDecode}
          className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-on-primary shadow-clay transition-all duration-300 ease-spring"
        >
          解码
        </button>
        <button
          onClick={() => { clearInput(); setResult(null); }}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">JWT Token</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="粘贴 JWT Token..."
            className="w-full h-24 px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        {isError && result && 'error' in result && (
          <div className="px-3 py-2 rounded-lg bg-error/10 text-error text-sm">
            {result.error}
          </div>
        )}

        {decoded && (
          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Header</div>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <div className="h-28">
                <CodeEditor
                  value={JSON.stringify(decoded.header, null, 2)}
                  language="json"
                  readOnly
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Payload</div>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
              <div className="h-40">
                <CodeEditor
                  value={JSON.stringify(decoded.payload, null, 2)}
                  language="json"
                  readOnly
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">状态:</span>
                <span className={decoded.isExpired ? 'text-error text-sm font-medium' : 'text-success text-sm font-medium'}>
                  {decoded.isExpired ? '已过期' : '有效'}
                </span>
              </div>
              {decoded.issuedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">签发时间:</span>
                  <span className="text-sm text-on-surface font-mono">{decoded.issuedAt}</span>
                </div>
              )}
              {decoded.expiresAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">过期时间:</span>
                  <span className="text-sm text-on-surface font-mono">{decoded.expiresAt}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
