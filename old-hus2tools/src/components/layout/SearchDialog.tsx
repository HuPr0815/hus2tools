import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchTools } from '@/lib/tool-registry';
import type { ToolDefinition } from '@/types/tool';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ToolDefinition[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setVisible(true);
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (visible) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchTools(query));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = useCallback(
    (tool: ToolDefinition) => {
      if (tool.type === 'internal') navigate(`/${tool.id}`);
      else window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className={cn(
          'absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg bg-bg-secondary rounded-clay-lg shadow-clay overflow-hidden',
          'transition-all duration-300 ease-spring',
          open
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-[0.96]'
        )}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-clay-gray-medium/20">
          <div className="flex items-center justify-center w-8 h-8 rounded-clay-sm bg-clay-green-light shadow-clay-green shrink-0">
            <Search className="w-4 h-4 text-clay-green-dark" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索工具..."
            className="flex-1 bg-transparent px-2 py-1 text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        {results.length > 0 && (
          <ul className="max-h-64 overflow-y-auto py-2 px-2">
            {results.map((tool, index) => (
              <li key={tool.id}>
                <button
                  onClick={() => handleSelect(tool)}
                  className={cn(
                    'flex items-center w-full px-4 py-3 text-sm transition-all duration-200 ease-spring',
                    index === selectedIndex
                      ? 'bg-clay-green-light text-clay-green-dark rounded-clay shadow-clay-green font-medium'
                      : 'text-text-secondary hover:bg-clay-gray-light hover:text-text-primary rounded-clay'
                  )}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 opacity-70">
                    {tool.icon}
                  </span>
                  <span className="ml-3 truncate">{tool.name}</span>
                  <span className="ml-auto text-xs text-text-muted truncate max-w-[200px]">
                    {tool.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim() && results.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-text-muted">
            未找到匹配的工具
          </div>
        )}

        <div className="flex items-center gap-3 px-5 py-2.5 border-t border-clay-gray-medium/20">
          <kbd className="text-[10px] text-text-muted/50 bg-bg-tertiary/60 px-1.5 py-0.5 rounded-lg shadow-clay font-mono">↑↓</kbd>
          <span className="text-[10px] text-text-muted/40">导航</span>
          <kbd className="text-[10px] text-text-muted/50 bg-bg-tertiary/60 px-1.5 py-0.5 rounded-lg shadow-clay font-mono">↵</kbd>
          <span className="text-[10px] text-text-muted/40">选择</span>
          <kbd className="text-[10px] text-text-muted/50 bg-bg-tertiary/60 px-1.5 py-0.5 rounded-lg shadow-clay font-mono">Esc</kbd>
          <span className="text-[10px] text-text-muted/40">关闭</span>
        </div>
      </div>
    </div>
  );
}
