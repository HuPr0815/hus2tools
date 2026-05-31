import { useMemo, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { usePersistInput } from '@/hooks/usePersistInput';
import { markdownToHtml } from './utils';

export default function MarkdownPreview() {
  const [input, setInput, clearInput] = usePersistInput('markdown-preview');

  const html = useMemo(() => {
    if (!input) return '';
    return markdownToHtml(input);
  }, [input]);

  const handleClear = useCallback(() => {
    clearInput();
  }, [clearInput]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary-container" />
        <div>
          <h2 className="text-lg font-semibold text-on-surface font-heading">Markdown 预览</h2>
          <p className="text-sm text-on-surface-variant">实时 Markdown 渲染预览</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          清空
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Markdown</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入 Markdown 内容..."
            className="flex-1 min-h-0 w-full px-3 py-2 text-sm rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono resize-none"
          />
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">预览</div>
          <div
            className="flex-1 min-h-0 overflow-auto rounded-lg bg-white text-gray-900 p-4 text-sm leading-relaxed prose-sm"
            dangerouslySetInnerHTML={{ __html: html || '<span class="text-gray-400">预览将显示在这里...</span>' }}
            style={{
              wordBreak: 'break-word',
            }}
          />
        </div>
      </div>
    </div>
  );
}
