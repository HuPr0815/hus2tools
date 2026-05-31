import { useState, useRef, useEffect } from 'react';
import { Search, Palette, Plus, Contrast, Bell, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearchClick: () => void;
  onMenuClick: () => void;
}

const THEME_COLORS = [
  { key: 'pink', bg: 'bg-[#ffb3d9]', primary: '#ad2c4d', deep: '#ff6a88', light: '#ffc8dd', rgb: '173, 44, 77' },
  { key: 'blue', bg: 'bg-[#a2d2ff]', primary: '#356590', deep: '#5a9fd4', light: '#cae9ff', rgb: '53, 101, 144' },
  { key: 'purple', bg: 'bg-[#d4a5f3]', primary: '#7e5ca0', deep: '#b377dc', light: '#e4c1f9', rgb: '126, 92, 160' },
  { key: 'green', bg: 'bg-[#b7e4c7]', primary: '#0e6c4a', deep: '#2d6a4f', light: '#d8f3dc', rgb: '14, 108, 74' },
  { key: 'yellow', bg: 'bg-[#ffe6a7]', primary: '#d4a373', deep: '#ffcc77', light: '#fff4bd', rgb: '212, 163, 115' },
];

export default function Header({ onSearchClick, onMenuClick }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [spinning, setSpinning] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setSpinning(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setSpinning(false), 350);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAccentTheme = (t: typeof THEME_COLORS[0]) => {
    document.documentElement.style.setProperty('--color-primary', t.primary);
    document.documentElement.style.setProperty('--color-clay-deep', t.deep);
    document.documentElement.style.setProperty('--color-clay-bg', t.light);
    document.documentElement.style.setProperty('--primary-rgb', t.rgb);
    setPaletteOpen(false);
  };

  return (
    <header className={cn(
      'sticky top-0 h-14 md:h-20 bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-40 transition-all',
      isScrolled && 'shadow-md'
    )}>
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface shadow-clay text-on-surface-variant hover:scale-110 spring-transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className={cn('w-full relative group spring-transition', isSearchFocused && 'scale-[1.01]')}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            onClick={onSearchClick}
            placeholder="Search for tools or files..."
            className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-12 pr-4 shadow-clay-inset focus:ring-2 focus:ring-primary/20 spring-transition font-body-sm text-body-sm cursor-pointer"
            readOnly
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block" ref={paletteRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setPaletteOpen(!paletteOpen); }}
            className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded-full bg-surface shadow-clay hover:scale-110 spring-transition text-on-surface-variant animate-float-mini"
          >
            <Palette className="w-5 h-5" />
          </button>
          {paletteOpen && (
            <div className="absolute top-16 right-0 w-48 bg-white dark:bg-surface-container rounded-2xl shadow-clay p-4 flex flex-wrap gap-3 z-50 pop-in">
              {THEME_COLORS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleAccentTheme(t)}
                  className={cn('w-8 h-8 rounded-full shadow-sm border-2 border-white hover:scale-110 transition-transform cursor-pointer', t.bg)}
                  title={t.key}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded-full bg-surface shadow-clay hover:scale-110 spring-transition text-on-surface-variant"
        >
          <span className={cn(spinning && 'animate-spin-once')}>
            <Contrast className="w-5 h-5" />
          </span>
        </button>

        <div className="relative" ref={notifRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); }}
            className="hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-surface shadow-clay hover:scale-110 spring-transition text-on-surface-variant relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
          </button>
          {notifOpen && (
            <div className="absolute top-16 right-0 w-80 bg-white dark:bg-surface-container rounded-2xl shadow-clay z-50 pop-in overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                <h3 className="font-bold text-sm">通知</h3>
                <button className="text-xs text-primary hover:underline" onClick={() => setNotifOpen(false)}>全部已读</button>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {[
                  { title: '新工具上线', desc: '图片裁剪工具已更新至 v2.0', time: '5分钟前', unread: true },
                  { title: '系统维护通知', desc: '今晚 23:00-01:00 进行例行维护', time: '1小时前', unread: true },
                  { title: '功能更新', desc: 'JSON 格式化工具新增压缩模式', time: '3小时前', unread: false },
                  { title: '欢迎加入', desc: '欢迎使用 TestKit Pro 工具集', time: '1天前', unread: false },
                ].map((n, i) => (
                  <div key={i} className={cn('p-4 flex gap-3 hover:bg-surface-container-low transition-colors cursor-pointer', n.unread && 'bg-primary/5')}>
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.unread ? 'bg-primary' : 'bg-transparent')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{n.title}</p>
                      <p className="text-xs text-on-surface-variant truncate">{n.desc}</p>
                      <p className="text-[10px] text-outline mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-outline-variant/20 text-center">
                <button className="text-xs text-primary font-semibold hover:underline" onClick={() => setNotifOpen(false)}>查看全部通知</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-outline-variant mx-2 hidden md:block" />

        <button className="bg-primary text-on-primary px-4 md:px-6 py-2.5 rounded-full font-bold shadow-clay hover:scale-105 spring-transition active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">New Project</span>
        </button>
      </div>
    </header>
  );
}
