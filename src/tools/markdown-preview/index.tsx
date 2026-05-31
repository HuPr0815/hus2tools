import { useState, useRef, useCallback } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { usePersistInput } from '@/hooks/usePersistInput';
import ToolHeader from '@/components/shared/ToolHeader';
import ClayToggle from '@/components/shared/ClayToggle';
import CodeEditor from '@/components/shared/CodeEditor';
import CopyButton from '@/components/shared/CopyButton';
import { cn } from '@/lib/utils';
import { markdownToHtml } from './utils';

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = usePersistInput('markdown-preview');
  const [syncScroll, setSyncScroll] = useState(true);
  const [theme, setTheme] = useState('default');
  const previewRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const html = markdownToHtml(markdown);

  const handleEditorScroll = useCallback(() => {
    if (!syncScroll || !previewRef.current || !editorContainerRef.current) return;
    const editor = editorContainerRef.current.querySelector('.cm-scroller');
    if (!editor) return;
    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  }, [syncScroll]);

  return (
    <div className="pt-20 pb-12 px-container-padding min-h-screen flex flex-col gap-gutter">
      <ToolHeader
        icon={<FileText className="w-10 h-10" />}
        title="Markdown 预览"
        description="实时 Markdown 渲染预览"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <aside className="lg:col-span-1 space-y-gutter">
          <div className="p-container-padding bg-surface rounded-[2rem] shadow-clay border border-white/30">
            <div className="flex flex-col gap-6">
              <ClayToggle
                label="同步滚动"
                description="编辑器与预览同步滚动"
                checked={syncScroll}
                onChange={setSyncScroll}
              />

              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">主题</label>
                <div className="flex p-1 bg-surface-container dark:bg-inverse-surface rounded-2xl shadow-clay-inset">
                  {['default', 'github', 'dark'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-bold clay-spring capitalize',
                        theme === t
                          ? 'bg-surface-container-lowest dark:bg-surface text-primary shadow-clay'
                          : 'text-on-surface-variant'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="font-label text-xs font-semibold text-on-surface-variant">操作</label>
                <div className="flex gap-2">
                  <CopyButton text={markdown} />
                  <button
                    onClick={() => setMarkdown('')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs bg-surface-container dark:bg-inverse-surface text-on-surface-variant shadow-clay-inset clay-spring"
                  >
                    <Trash2 className="w-3 h-3" />
                    清空
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <div className="flex flex-col lg:flex-row gap-0 h-full min-h-[500px] bg-surface-container-lowest dark:bg-black/5 rounded-[2.5rem] shadow-clay overflow-hidden" onScroll={handleEditorScroll as unknown as (() => void) | undefined}>
            <div className="flex flex-col h-full min-h-[300px] lg:flex-1 lg:border-r border-b lg:border-b-0 border-outline-variant/30" ref={editorContainerRef}>
              <div className="px-4 py-2 border-b border-outline-variant/30 bg-surface-container-low dark:bg-inverse-surface">
                <span className="text-xs font-semibold text-on-surface-variant">Markdown 编辑</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={markdown}
                  onChange={setMarkdown}
                  language="markdown"
                  height="100%"
                />
              </div>
            </div>
            <div className="flex flex-col h-full min-h-[300px] lg:flex-1">
              <div className="px-4 py-2 border-b border-outline-variant/30 bg-surface-container-low dark:bg-inverse-surface">
                <span className="text-xs font-semibold text-on-surface-variant">预览</span>
              </div>
              <div
                ref={previewRef}
                className="flex-1 overflow-auto p-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
