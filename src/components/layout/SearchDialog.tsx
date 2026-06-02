import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ExternalLink } from 'lucide-react';
import { searchTools, getGroupedTools } from '@/lib/tool-registry';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/tool';
import type { ToolDefinition, ToolCategory } from '@/types/tool';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const filteredGrouped = query.trim()
    ? (() => {
        const results = searchTools(query);
        const grouped = {} as Record<ToolCategory, ToolDefinition[]>;
        for (const cat of CATEGORY_ORDER) grouped[cat] = [];
        for (const tool of results) {
          if (!grouped[tool.category]) grouped[tool.category] = [];
          grouped[tool.category].push(tool);
        }
        return grouped;
      })()
    : getGroupedTools();

  const hasResults = Object.values(filteredGrouped).some(tools => tools.length > 0);

  const handleToolClick = (tool: ToolDefinition) => {
    if (tool.type === 'internal') navigate(`/${tool.id}`);
    else window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface dark:bg-surface-container rounded-2xl shadow-clay overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30">
          <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!hasResults && query.trim() && (
            <div className="text-center py-8 text-sm text-on-surface-variant">
              未找到匹配 "{query}" 的工具
            </div>
          )}
          {CATEGORY_ORDER.map((cat) => {
            const tools = filteredGrouped[cat];
            if (!tools || tools.length === 0) return null;
            return (
              <div key={cat} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  {CATEGORY_LABELS[cat]}
                </div>
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container-high spring-transition"
                  >
                    <span className="shrink-0 w-4 h-4 flex items-center justify-center opacity-70">{tool.icon}</span>
                    <span className="truncate">{tool.name}</span>
                    <span className="ml-auto text-[10px] text-on-surface-variant/50 truncate max-w-[200px]">{tool.description}</span>
                    {tool.type === 'external' && <ExternalLink className="w-3 h-3 shrink-0 opacity-40" />}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
