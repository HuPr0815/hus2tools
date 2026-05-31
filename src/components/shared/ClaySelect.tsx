import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClaySelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ClaySelectProps {
  options: ClaySelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ClaySelect({
  options,
  value,
  onChange,
  label,
  placeholder = '请选择',
  error,
  searchable = false,
  className,
  size = 'md',
}: ClaySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center justify-between rounded-2xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 text-on-surface transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-clay',
            'hover:shadow-clay',
            size === 'sm' && 'px-3 py-1.5 text-xs',
            size === 'md' && 'px-4 py-3 text-sm',
            error && 'ring-2 ring-error/30'
          )}
        >
          <span className={cn('flex items-center gap-2 truncate', !selected && 'text-outline')}>
            {selected?.icon}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-on-surface-variant transition-transform duration-300 shrink-0 ml-2',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className={cn(
            'absolute z-50 top-full mt-1.5 w-full rounded-2xl shadow-clay bg-surface-container-lowest dark:bg-surface-container overflow-hidden',
            'animate-in fade-in slide-in-from-top-1 duration-200',
            'border border-outline-variant/20'
          )}>
            {searchable && (
              <div className="p-2 border-b border-outline-variant/20">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-surface-container-low dark:bg-black/20 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-outline text-center">无匹配项</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left',
                      'hover:bg-primary-container/30',
                      opt.value === value
                        ? 'text-primary dark:text-clay-green-main font-semibold bg-primary-container/20'
                        : 'text-on-surface-variant'
                    )}
                  >
                    {opt.icon}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.value === value && <Check className="w-4 h-4 text-primary dark:text-clay-green-main shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-error ml-3">{error}</p>}
    </div>
  );
}
