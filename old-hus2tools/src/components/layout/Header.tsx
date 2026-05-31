import { useState } from 'react';
import { Sun, Moon, Wrench, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearchClick: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [spinning, setSpinning] = useState(false);

  const toggleTheme = () => {
    setSpinning(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setSpinning(false), 350);
  };

  return (
    <header className="flex items-center justify-center h-14 px-4 bg-bg-secondary/80 backdrop-blur-md border-b border-clay-gray-medium/20 shrink-0 animate-slide-down">
      <div className="flex items-center w-full max-w-2xl bg-bg-primary/60 backdrop-blur-sm rounded-clay-full px-3 py-1.5 shadow-clay">
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-9 h-9 rounded-clay-lg bg-clay-green-light shadow-clay-green flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-clay-green-dark" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-clay-green-dark">Test</span>
            <span className="text-text-primary">Kit</span>
          </span>
        </div>

        <div className="flex-1">
          <button
            onClick={onSearchClick}
            className="flex items-center w-full bg-bg-tertiary rounded-clay px-3 py-2 text-xs text-text-muted hover:text-text-secondary shadow-clay-inset transition-all duration-300 ease-spring"
          >
            <Search className="w-3.5 h-3.5 mr-2 shrink-0" />
            <span>搜索工具...</span>
            <kbd className="ml-auto text-[10px] text-text-muted/50 bg-bg-secondary/60 px-1.5 py-0.5 rounded-clay-full shadow-clay font-mono">⌘K</kbd>
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="ml-3 p-2.5 rounded-clay text-text-muted hover:text-text-secondary bg-clay-yellow-light/50 shadow-clay hover:shadow-clay-hover active:shadow-clay-active transition-all duration-300 ease-spring"
          title={resolvedTheme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
        >
          <span className={cn(spinning && 'animate-spin-once')}>
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-clay-yellow-dark" /> : <Moon className="w-4 h-4 text-clay-purple-dark" />}
          </span>
        </button>
      </div>
    </header>
  );
}
