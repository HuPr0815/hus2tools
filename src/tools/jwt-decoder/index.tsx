import { useState } from 'react';
import { FileKey2, CheckCircle } from 'lucide-react';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import { usePersistInput } from '@/hooks/usePersistInput';
import { cn } from '@/lib/utils';
import { decodeJwt } from './utils';

export default function JwtDecoder() {
  const [input, setInput, _clearInput] = usePersistInput('jwt-decoder');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [expired, setExpired] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState('');

  const handleDecode = () => {
    const result = decodeJwt(input);
    if ('error' in result) {
      setHeader(result.error);
      setPayload('');
      setSignature('');
      setExpired(null);
      setExpiresAt('');
      return;
    }
    setHeader(JSON.stringify(result.header, null, 2));
    setPayload(JSON.stringify(result.payload, null, 2));
    setSignature(result.signature);
    setExpired(result.isExpired);
    setExpiresAt(result.expiresAt ?? '');
  };

  return (
    <BasicToolLayout
      title="JWT 解码"
      description="解码和检查 JSON Web Token"
      icon={<FileKey2 className="w-7 h-7" />}
      resultSection={
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="flex items-center gap-2 font-bold text-clay-green-deep dark:text-clay-green-main">
              <CheckCircle className="w-5 h-5" />
              解码结果
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant">Header</label>
                <CopyButton text={header} />
              </div>
              <div className="bg-surface dark:bg-black/40 rounded-2xl p-4 shadow-clay-inset min-h-[100px]">
                <CodeEditor value={header} language="json" readOnly height="100px" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant">Payload</label>
                <CopyButton text={payload} />
              </div>
              <div className="bg-surface dark:bg-black/40 rounded-2xl p-4 shadow-clay-inset min-h-[100px]">
                <CodeEditor value={payload} language="json" readOnly height="100px" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant">Signature</label>
                <CopyButton text={signature} />
              </div>
              <div className="bg-surface dark:bg-black/40 rounded-2xl p-4 shadow-clay-inset min-h-[100px]">
                <CodeEditor value={signature} readOnly height="100px" />
              </div>
            </div>
          </div>

          {expired !== null && (
            <div
              className={cn(
                'px-4 py-3 rounded-2xl text-sm',
                expired ? 'bg-clay-pink-light/30 text-clay-pink-deep' : 'bg-clay-green-light/30 text-clay-green-deep'
              )}
            >
              {expired ? (
                <span>✗ Token 已过期{expiresAt && ` (过期时间: ${expiresAt})`}</span>
              ) : (
                <span>✓ Token 有效{expiresAt && ` (过期时间: ${expiresAt})`}</span>
              )}
            </div>
          )}
        </div>
      }
      showResult={!!header}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <label className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main ml-4">JWT Token</label>
        <div className="w-full h-24 p-4 rounded-3xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 JWT Token..."
            className="w-full h-full text-sm font-mono bg-transparent text-on-surface placeholder:text-outline focus:outline-none resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleDecode}
        className="group relative w-full py-5 rounded-full bg-clay-green-deep text-white font-bold shadow-clay hover:shadow-clay-hover clay-button overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <FileKey2 className="w-5 h-5" />
          解码
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </BasicToolLayout>
  );
}
